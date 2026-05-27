<?php

namespace App\Console\Commands;

use App\Models\Child;
use App\Models\ChildVaccineDose;
use App\Models\ChildVitaminDose;
use App\Models\DashboardCache;
use App\Models\HealthLog;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RefreshDashboardCache extends Command
{
    protected $signature = 'dashboard:refresh {barangay?}';

    protected $description = 'Refresh materialized dashboard cache for one or all barangays';

    public function handle(): int
    {
        $barangay = $this->argument('barangay');
        $barangays = $barangay ? [$barangay] : Child::distinct()->pluck('barangay')->toArray();

        $progress = $this->output->createProgressBar(count($barangays));
        $progress->start();

        foreach ($barangays as $bgy) {
            $this->refreshBarangay($bgy);
            $progress->advance();
        }

        $progress->finish();
        $this->newLine();
        $this->info('Dashboard cache refreshed for '.count($barangays).' barangay(s).');

        return self::SUCCESS;
    }

    public function refreshBarangay(string $barangay): void
    {
        $now = Carbon::now();
        $today = $now->copy()->startOfDay();
        $week = $now->copy()->startOfWeek();
        $month = $now->copy()->startOfMonth();
        $year = $now->copy()->startOfYear();

        $childrenQuery = Child::where('barangay', $barangay)
            ->where('birthdate', '>=', $now->copy()->subMonths(60));

        $totalChildren = $childrenQuery->count();
        $maleCount = (clone $childrenQuery)->where('sex', 'Male')->count();
        $femaleCount = (clone $childrenQuery)->where('sex', 'Female')->count();

        $todayChildren = (clone $childrenQuery)->whereDate('created_at', $today)->count();

        $avgBmi = (clone $childrenQuery)
            ->whereNotNull('weight')
            ->whereNotNull('height')
            ->where('weight', '>', 0)
            ->where('height', '>', 0)
            ->selectRaw('AVG(CASE WHEN height > 0 THEN weight * 10000.0 / (height * height) ELSE NULL END) as avg_bmi')
            ->value('avg_bmi');

        $ageBreakdown = [
            '0to5' => (clone $childrenQuery)
                ->where('birthdate', '>=', $now->copy()->subMonthsNoOverflow(5)->startOfDay())
                ->where('birthdate', '<=', $now->copy()->endOfDay())
                ->count(),
            '6to11' => (clone $childrenQuery)
                ->where('birthdate', '>=', $now->copy()->subMonthsNoOverflow(11)->startOfDay())
                ->where('birthdate', '<', $now->copy()->subMonthsNoOverflow(5)->startOfDay())
                ->count(),
            '12to23' => (clone $childrenQuery)
                ->where('birthdate', '>=', $now->copy()->subMonthsNoOverflow(23)->startOfDay())
                ->where('birthdate', '<', $now->copy()->subMonthsNoOverflow(11)->startOfDay())
                ->count(),
            '24to56' => (clone $childrenQuery)
                ->where('birthdate', '>=', $now->copy()->subMonthsNoOverflow(56)->startOfDay())
                ->where('birthdate', '<', $now->copy()->subMonthsNoOverflow(23)->startOfDay())
                ->count(),
        ];

        $healthLogsBase = HealthLog::whereHas('child', fn ($q) => $q
            ->where('barangay', $barangay)
            ->where('birthdate', '>=', $now->copy()->subMonths(60)));

        $totalHealthLogs = (clone $healthLogsBase)->count();
        $todayHealthLogs = (clone $healthLogsBase)->whereDate('created_at', $today)->count();
        $weekHealthLogs = (clone $healthLogsBase)->where('created_at', '>=', $week)->count();
        $monthHealthLogs = (clone $healthLogsBase)->where('created_at', '>=', $month)->count();
        $yearHealthLogs = (clone $healthLogsBase)->where('created_at', '>=', $year)->count();

        $latestPerChild = DB::table('health_logs as hl')
            ->join(DB::raw('(SELECT child_id, MAX(created_at) as max_created FROM health_logs GROUP BY child_id) as latest'), function ($j) {
                $j->on('hl.child_id', '=', 'latest.child_id')
                    ->on('hl.created_at', '=', 'latest.max_created');
            })
            ->join('children', 'hl.child_id', '=', 'children.id')
            ->where('children.barangay', $barangay)
            ->where('children.birthdate', '>=', $now->copy()->subMonths(60))
            ->select('hl.nutrition_status', 'hl.vitamin_a', 'hl.deworming')
            ->get();

        $nutritionBreakdown = [
            'normal' => $latestPerChild->where('nutrition_status', 'Normal')->count(),
            'underweight' => $latestPerChild->filter(fn ($l) => in_array($l->nutrition_status, ['Underweight', 'Moderate Malnutrition', 'Severe Malnutrition']))->count(),
            'overweight' => $latestPerChild->filter(fn ($l) => in_array($l->nutrition_status, ['Overweight', 'Obese']))->count(),
            'stunted' => $latestPerChild->filter(fn ($l) => in_array($l->nutrition_status, ['Stunted', 'Severely Stunted']))->count(),
        ];

        $vitaminAGiven = $latestPerChild->where('vitamin_a', true)->count();
        $dewormingGiven = $latestPerChild->where('deworming', true)->count();
        $totalWithLogs = $latestPerChild->count();

        $monthlyLogs = [];
        for ($i = 11; $i >= 0; $i--) {
            $m = Carbon::now()->subMonthsNoOverflow($i);
            $monthlyLogs[$m->format('M Y')] = (clone $healthLogsBase)
                ->whereYear('created_at', $m->year)
                ->whereMonth('created_at', $m->month)
                ->count();
        }

        $pendingDoses = ChildVaccineDose::whereNull('date_given')
            ->whereNotNull('next_due_date')
            ->whereHas('childVaccine.child', fn ($q) => $q->where('barangay', $barangay)->where('birthdate', '>=', $now->copy()->subMonths(60)))
            ->with('childVaccine.child:id,barangay')
            ->get()
            ->groupBy('childVaccine.child_id');

        $overdueCount = 0;
        $upcomingCount = 0;
        foreach ($pendingDoses as $doses) {
            $hasOverdue = $doses->some(fn ($d) => $d->next_due_date && $d->next_due_date->lt($now));
            $hasUpcoming = $doses->some(fn ($d) => $d->next_due_date && ! $d->next_due_date->lt($now));
            if ($hasOverdue) {
                $overdueCount++;
            }
            if ($hasUpcoming) {
                $upcomingCount++;
            }
        }

        $pendingVitaminDoses = ChildVitaminDose::whereNull('date_given')
            ->whereNotNull('next_due_date')
            ->whereHas('childVitamin.child', fn ($q) => $q->where('barangay', $barangay)->where('birthdate', '>=', $now->copy()->subMonths(60)))
            ->with('childVitamin.child:id,barangay')
            ->get()
            ->groupBy('childVitamin.child_id');

        $vitaminOverdue = 0;
        $vitaminUpcoming = 0;
        foreach ($pendingVitaminDoses as $doses) {
            $hasOverdue = $doses->some(fn ($d) => $d->next_due_date && $d->next_due_date->lt($now));
            $hasUpcoming = $doses->some(fn ($d) => $d->next_due_date && ! $d->next_due_date->lt($now));
            if ($hasOverdue) {
                $vitaminOverdue++;
            }
            if ($hasUpcoming) {
                $vitaminUpcoming++;
            }
        }

        DashboardCache::updateOrCreate(
            ['barangay' => $barangay],
            [
                'total_children' => $totalChildren,
                'total_health_logs' => $totalHealthLogs,
                'nutrition_breakdown' => $nutritionBreakdown,
                'age_breakdown' => $ageBreakdown,
                'monthly_logs' => $monthlyLogs,
                'vaccine_overdue' => $overdueCount,
                'vaccine_upcoming' => $upcomingCount,
                'vitamin_overdue' => $vitaminOverdue,
                'vitamin_upcoming' => $vitaminUpcoming,
                'today_children' => $todayChildren,
                'today_health_logs' => $todayHealthLogs,
                'week_health_logs' => $weekHealthLogs,
                'month_health_logs' => $monthHealthLogs,
                'year_health_logs' => $yearHealthLogs,
                'avg_bmi' => $avgBmi,
                'male_count' => $maleCount,
                'female_count' => $femaleCount,
                'vitamin_a_given' => $vitaminAGiven,
                'deworming_given' => $dewormingGiven,
                'total_with_logs' => $totalWithLogs,
            ]
        );
    }
}
