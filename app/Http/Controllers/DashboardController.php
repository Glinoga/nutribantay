<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\ChildVaccineDose;
use App\Models\HealthLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    private function getDateRange(string $period): array
    {
        $now = Carbon::now();

        switch ($period) {
            case 'daily':
                return [
                    'start' => $now->copy()->startOfDay(),
                    'end' => $now->copy()->endOfDay(),
                ];
            case 'weekly':
                return [
                    'start' => $now->copy()->startOfWeek(),
                    'end' => $now->copy()->endOfWeek(),
                ];
            case 'monthly':
                return [
                    'start' => $now->copy()->startOfMonth(),
                    'end' => $now->copy()->endOfMonth(),
                ];
            case 'yearly':
            default:
                return [
                    'start' => $now->copy()->startOfYear(),
                    'end' => $now->copy()->endOfYear(),
                ];
        }
    }

    private function getBaseQuery(Request $request)
    {
        $user = auth()->user();

        // All users (including Admin) restricted to own barangay - matching commit bfcd512
        return Child::query()->where('barangay', $user->barangay);
    }

    private function getHealthlogBaseQuery(Request $request)
    {
        $user = auth()->user();

        $query = HealthLog::query();

        if (! $user->hasRole('Admin')) {
            $query->whereHas('child', fn ($q) => $q->where('barangay', $user->barangay));
        }

        return $query;
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        $isAdmin = $user->hasRole('Admin');
        $barangay = $user->barangay;

        // Total children
        $totalChildren = $this->getBaseQuery($request)->count();

        // Get age ranges (for monitoring) - using PHP Carbon for DB compatibility
        $children = $this->getBaseQuery($request)->get();

        $now = Carbon::now();
        $age0to5 = $children->filter(fn ($c) => $c->birthdate && $c->birthdate->floatDiffInMonths($now) >= 0 && $c->birthdate->floatDiffInMonths($now) <= 5)->count();
        $age6to11 = $children->filter(fn ($c) => $c->birthdate && $c->birthdate->floatDiffInMonths($now) >= 6 && $c->birthdate->floatDiffInMonths($now) <= 11)->count();
        $age12to35 = $children->filter(fn ($c) => $c->birthdate && $c->birthdate->floatDiffInMonths($now) >= 12 && $c->birthdate->floatDiffInMonths($now) <= 35)->count();
        $age36plus = $children->filter(fn ($c) => $c->birthdate && $c->birthdate->floatDiffInMonths($now) >= 36)->count();

        // Current year healthlogs
        $currentYear = Carbon::now()->startOfYear();

        // Get latest healthlogs per child for nutrition status
        $latestHealthlogs = HealthLog::select('health_logs.*')
            ->whereHas('child', fn ($q) => $q->where('barangay', $barangay))
            ->where('created_at', '>=', $currentYear)
            ->latest('created_at')
            ->get()
            ->groupBy('child_id')
            ->map(fn ($logs) => $logs->first());

        // Nutrition status breakdown
        $nutritionStatus = [
            'normal' => $latestHealthlogs->where('nutrition_status', 'Normal')->count(),
            'underweight' => $latestHealthlogs->whereIn('nutrition_status', ['Underweight', 'Moderate Malnutrition', 'Severe Malnutrition'])->count(),
            'overweight' => $latestHealthlogs->whereIn('nutrition_status', ['Overweight', 'Obese'])->count(),
            'stunted' => $latestHealthlogs->whereIn('nutrition_status', ['Stunted', 'Severely Stunted'])->count(),
        ];

        // Vitamin A and Deworming coverage
        $vitaminA = $latestHealthlogs->where('vitamin_a', true)->count();
        $deworming = $latestHealthlogs->where('deworming', true)->count();
        $totalWithLogs = $latestHealthlogs->count();

        // Today stats
        $today = Carbon::now()->startOfDay();
        $childrenRegisteredToday = $this->getBaseQuery($request)
            ->whereDate('created_at', $today)
            ->count();
        $healthlogsToday = $this->getHealthlogBaseQuery($request)
            ->whereDate('created_at', $today)
            ->count();

        // This week
        $thisWeek = Carbon::now()->startOfWeek();
        $healthlogsThisWeek = $this->getHealthlogBaseQuery($request)
            ->where('created_at', '>=', $thisWeek)
            ->count();

        // This month
        $thisMonth = Carbon::now()->startOfMonth();
        $healthlogsThisMonth = $this->getHealthlogBaseQuery($request)
            ->where('created_at', '>=', $thisMonth)
            ->count();

        // This year
        $healthlogsThisYear = $this->getHealthlogBaseQuery($request)
            ->where('created_at', '>=', $currentYear)
            ->count();

        $monthlyTrend6 = [];
        $monthlyTrend12 = [];

        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthlyTrend6[] = [
                'month' => $month->format('M Y'),
                'count' => HealthLog::whereHas('child', fn ($q) => $q->where('barangay', $barangay))
                    ->whereYear('created_at', $month->year)
                    ->whereMonth('created_at', $month->month)
                    ->count(),
            ];
        }

        for ($i = 11; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthlyTrend12[] = [
                'month' => $month->format('M Y'),
                'count' => HealthLog::whereHas('child', fn ($q) => $q->where('barangay', $barangay))
                    ->whereYear('created_at', $month->year)
                    ->whereMonth('created_at', $month->month)
                    ->count(),
            ];
        }

        $last6MonthsLogs = HealthLog::whereHas('child', fn ($q) => $q->where('barangay', $barangay))
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->get();

        $statusDistribution = [
            'normal' => $last6MonthsLogs->where('nutrition_status', 'Normal')->count(),
            'underweight' => $last6MonthsLogs->whereIn('nutrition_status', ['Underweight', 'Moderate Malnutrition', 'Severe Malnutrition'])->count(),
            'overweight' => $last6MonthsLogs->whereIn('nutrition_status', ['Overweight', 'Obese'])->count(),
            'stunted' => $last6MonthsLogs->whereIn('nutrition_status', ['Stunted', 'Severely Stunted'])->count(),
        ];

        // Vaccine follow-ups
        $pendingDoses = ChildVaccineDose::whereNull('date_given')
            ->whereNotNull('next_due_date')
            ->whereHas('childVaccine.child', fn ($q) => $q->where('barangay', $barangay))
            ->with([
                'childVaccine.child:id,first_name,middle_initial,last_name,barangay',
                'childVaccine.vaccine:id,name',
            ])
            ->get();

        $overdueDoses = $pendingDoses->filter(fn ($dose) => $dose->next_due_date && $dose->next_due_date->isPast());

        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        $dueThisMonth = $pendingDoses->filter(fn ($dose) => $dose->next_due_date
            && $dose->next_due_date->between($startOfMonth, $endOfMonth));

        $followUps = [];

        foreach ($overdueDoses as $dose) {
            $cv = $dose->childVaccine;
            $followUps[] = [
                'child_id' => $cv->child->id,
                'child_name' => $cv->child->fullname,
                'vaccine_name' => $cv->vaccine->name,
                'dose_number' => $dose->dose_number,
                'next_due_date' => $dose->next_due_date->format('Y-m-d'),
                'status' => 'Overdue',
            ];
        }

        foreach ($dueThisMonth as $dose) {
            if ($overdueDoses->contains('id', $dose->id)) {
                continue;
            }
            $cv = $dose->childVaccine;
            $followUps[] = [
                'child_id' => $cv->child->id,
                'child_name' => $cv->child->fullname,
                'vaccine_name' => $cv->vaccine->name,
                'dose_number' => $dose->dose_number,
                'next_due_date' => $dose->next_due_date->format('Y-m-d'),
                'status' => 'Upcoming',
            ];
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'total_children' => $totalChildren,
                'age_breakdown' => [
                    '0to5' => $age0to5,
                    '6to11' => $age6to11,
                    '12to35' => $age12to35,
                    '36plus' => $age36plus,
                ],
                'nutrition_status' => $nutritionStatus,
                'vitamin_a' => [
                    'given' => $vitaminA,
                    'total' => $totalWithLogs,
                    'percentage' => $totalWithLogs > 0 ? round(($vitaminA / $totalWithLogs) * 100, 1) : 0,
                ],
                'deworming' => [
                    'given' => $deworming,
                    'total' => $totalWithLogs,
                    'percentage' => $totalWithLogs > 0 ? round(($deworming / $totalWithLogs) * 100, 1) : 0,
                ],
                'daily' => [
                    'children_registered' => $childrenRegisteredToday,
                    'healthlogs' => $healthlogsToday,
                ],
                'weekly' => [
                    'healthlogs' => $healthlogsThisWeek,
                ],
                'monthly' => [
                    'healthlogs' => $healthlogsThisMonth,
                ],
                'yearly' => [
                    'healthlogs' => $healthlogsThisYear,
                ],
            ],
            'trends' => [
                'monthly_6months' => $monthlyTrend6,
                'monthly_1year' => $monthlyTrend12,
                'status_distribution' => $statusDistribution,
            ],
            'vaccine_followups' => [
                'overdue_count' => $overdueDoses->count(),
                'due_this_month_count' => $dueThisMonth->count(),
                'follow_ups' => $followUps,
            ],
            'user_barangay' => $barangay,
            'is_admin' => $isAdmin,
        ]);
    }

    public function export(Request $request)
    {
        $period = $request->period ?? 'monthly';
        $range = $this->getDateRange($period);

        $user = auth()->user();
        $barangay = $user->barangay;

        // Get healthlogs for the period with latest child data
        $healthlogs = HealthLog::query()
            ->with(['child', 'user'])
            ->whereHas('child', fn ($q) => $q->where('barangay', $barangay))
            ->where('created_at', '>=', $range['start'])
            ->where('created_at', '<=', $range['end'])
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->exportCSV($healthlogs, $period);
    }

    private function getPeriodAwareTrends(string $period, string $barangay): array
    {
        $query = fn () => HealthLog::whereHas('child', fn ($q) => $q->where('barangay', $barangay));

        switch ($period) {
            case 'daily':
                $labels = [];
                $counts = [];
                for ($i = 6; $i >= 0; $i--) {
                    $date = Carbon::now()->subDays($i);
                    $labels[] = $date->format('M d');
                    $counts[] = $query()->whereDate('created_at', $date)->count();
                }
                break;

            case 'weekly':
                $labels = [];
                $counts = [];
                for ($i = 3; $i >= 0; $i--) {
                    $start = Carbon::now()->subWeeks($i)->startOfWeek();
                    $end = $start->copy()->endOfWeek();
                    $labels[] = $start->format('M d').' - '.$end->format('M d');
                    $counts[] = $query()->whereBetween('created_at', [$start, $end])->count();
                }
                break;

            case 'monthly':
                $labels = [];
                $counts = [];
                for ($i = 5; $i >= 0; $i--) {
                    $month = Carbon::now()->subMonths($i);
                    $labels[] = $month->format('M Y');
                    $counts[] = $query()
                        ->whereYear('created_at', $month->year)
                        ->whereMonth('created_at', $month->month)
                        ->count();
                }
                break;

            case 'yearly':
            default:
                $labels = [];
                $counts = [];
                for ($i = 2; $i >= 0; $i--) {
                    $year = Carbon::now()->subYears($i);
                    $labels[] = $year->format('Y');
                    $counts[] = $query()->whereYear('created_at', $year->year)->count();
                }
                break;
        }

        $trendLogs = match ($period) {
            'daily' => $query()->where('created_at', '>=', Carbon::now()->subDays(7))->get(),
            'weekly' => $query()->where('created_at', '>=', Carbon::now()->subWeeks(4))->get(),
            'monthly' => $query()->where('created_at', '>=', Carbon::now()->subMonths(6))->get(),
            default => $query()->where('created_at', '>=', Carbon::now()->subYears(3))->get(),
        };

        $statusDistribution = [
            'normal' => $trendLogs->where('nutrition_status', 'Normal')->count(),
            'underweight' => $trendLogs->whereIn('nutrition_status', ['Underweight', 'Moderate Malnutrition', 'Severe Malnutrition'])->count(),
            'overweight' => $trendLogs->whereIn('nutrition_status', ['Overweight', 'Obese'])->count(),
            'stunted' => $trendLogs->whereIn('nutrition_status', ['Stunted', 'Severely Stunted'])->count(),
        ];

        $total = $trendLogs->count();

        return [
            'trend' => collect(array_map(fn ($l, $c) => ['label' => $l, 'count' => $c], $labels, $counts)),
            'status_distribution' => $statusDistribution,
            'vitamin_a_percentage' => $total > 0 ? round(($trendLogs->where('vitamin_a', true)->count() / $total) * 100, 1) : 0,
            'deworming_percentage' => $total > 0 ? round(($trendLogs->where('deworming', true)->count() / $total) * 100, 1) : 0,
        ];
    }

    public function printView(Request $request)
    {
        $period = $request->period ?? 'monthly';
        $range = $this->getDateRange($period);

        $user = auth()->user();
        $barangay = $user->barangay;

        // Get latest healthlogs per child for the period
        $healthlogs = HealthLog::query()
            ->with(['child', 'user'])
            ->whereHas('child', fn ($q) => $q->where('barangay', $barangay))
            ->where('created_at', '>=', $range['start'])
            ->where('created_at', '<=', $range['end'])
            ->latest('created_at')
            ->get()
            ->groupBy('child_id')
            ->map(fn ($logs) => $logs->first());

        // Calculate stats for print view
        $totalChildren = $healthlogs->count();
        $nutritionStatus = [
            'normal' => $healthlogs->where('nutrition_status', 'Normal')->count(),
            'underweight' => $healthlogs->whereIn('nutrition_status', ['Underweight', 'Moderate Malnutrition', 'Severe Malnutrition'])->count(),
            'overweight' => $healthlogs->whereIn('nutrition_status', ['Overweight', 'Obese'])->count(),
            'stunted' => $healthlogs->whereIn('nutrition_status', ['Stunted', 'Severely Stunted'])->count(),
        ];

        $vitaminA = $healthlogs->where('vitamin_a', true)->count();
        $deworming = $healthlogs->where('deworming', true)->count();

        // Get period-aware trend data for charts
        $trends = $this->getPeriodAwareTrends($period, $barangay);

        return Inertia::render('DashboardPrint', [
            'period' => $period,
            'data' => [
                'healthlogs' => $healthlogs->values()->map(fn ($log) => [
                    'child_name' => $log->child->fullname ?? '',
                    'birthdate' => $log->child->birthdate ? Carbon::parse($log->child->birthdate)->format('Y-m-d') : '',
                    'age' => $log->age_in_months ?? floor(Carbon::parse($log->child->birthdate)->diffInMonths(Carbon::now())),
                    'sex' => $log->child->sex ?? '',
                    'weight' => $log->weight,
                    'height' => $log->height,
                    'bmi' => $log->bmi,
                    'nutrition_status' => $log->nutrition_status ?? 'N/A',
                    'vitamin_a' => $log->vitamin_a ? 'Yes' : 'No',
                    'deworming' => $log->deworming ? 'Yes' : 'No',
                    'micronutrient_powder' => $log->micronutrient_powder ? 'Yes' : 'No',
                    'last_visit' => $log->created_at ? Carbon::parse($log->created_at)->format('Y-m-d') : '',
                ])->values()->all(),
                'summary' => [
                    'total_children' => $totalChildren,
                    'period_start' => $range['start']->format('Y-m-d'),
                    'period_end' => $range['end']->format('Y-m-d'),
                    'nutrition_status' => $nutritionStatus,
                    'vitamin_a_given' => $vitaminA,
                    'deworming_given' => $deworming,
                ],
                'barangay' => $barangay,
                'generated_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'trends' => [
                    'trend' => $trends['trend']->values()->all(),
                    'status_distribution' => $trends['status_distribution'],
                    'vitamin_a_percentage' => $trends['vitamin_a_percentage'],
                    'deworming_percentage' => $trends['deworming_percentage'],
                ],
            ],
        ]);
    }

    private function exportCSV($healthlogs, string $period)
    {
        $range = $this->getDateRange($period);
        $user = auth()->user();
        $barangay = $user->barangay;

        // Compute summary stats
        $latestLogs = $healthlogs->groupBy('child_id')->map(fn ($logs) => $logs->first());
        $totalChildren = $latestLogs->count();
        $normal = $latestLogs->where('nutrition_status', 'Normal')->count();
        $underweight = $latestLogs->whereIn('nutrition_status', ['Underweight', 'Moderate Malnutrition', 'Severe Malnutrition'])->count();
        $overweight = $latestLogs->whereIn('nutrition_status', ['Overweight', 'Obese'])->count();
        $stunted = $latestLogs->whereIn('nutrition_status', ['Stunted', 'Severely Stunted'])->count();
        $vitaminA = $latestLogs->where('vitamin_a', true)->count();
        $deworming = $latestLogs->where('deworming', true)->count();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="dashboard_'.$period.'_'.date('Y-m-d').'.csv"',
        ];

        $callback = function () use ($healthlogs, $period, $range, $totalChildren, $normal, $underweight, $overweight, $stunted, $vitaminA, $deworming, $barangay) {
            $handle = fopen('php://output', 'w');

            // Summary header rows
            fputcsv($handle, ['Report Period', ucfirst($period)]);
            fputcsv($handle, ['Barangay', $barangay]);
            fputcsv($handle, ['Date Range', $range['start']->format('Y-m-d').' to '.$range['end']->format('Y-m-d')]);
            fputcsv($handle, ['Generated', Carbon::now()->format('Y-m-d H:i:s')]);
            fputcsv($handle, []);

            fputcsv($handle, ['Summary', '']);
            fputcsv($handle, ['Total Children', $totalChildren]);
            fputcsv($handle, ['Normal', $normal]);
            fputcsv($handle, ['Underweight', $underweight]);
            fputcsv($handle, ['Overweight', $overweight]);
            fputcsv($handle, ['Stunted', $stunted]);
            fputcsv($handle, ['Vitamin A Given', $vitaminA]);
            fputcsv($handle, ['Deworming Given', $deworming]);
            fputcsv($handle, []);

            // Data header row
            fputcsv($handle, [
                'Child Name',
                'Birthday',
                'Age (Months)',
                'Sex',
                'Weight (kg)',
                'Height (cm)',
                'BMI',
                'Nutrition Status',
                'Vitamin A',
                'Deworming',
                'MNP',
                'Last Visit',
            ]);

            // Data rows
            foreach ($healthlogs as $log) {
                fputcsv($handle, [
                    $log->child->fullname ?? '',
                    $log->child->birthdate ? Carbon::parse($log->child->birthdate)->format('Y-m-d') : '',
                    $log->age_in_months ?? floor(Carbon::parse($log->child->birthdate)->diffInMonths(Carbon::now())),
                    $log->child->sex ?? '',
                    $log->weight ?? '',
                    $log->height ?? '',
                    $log->bmi ?? '',
                    $log->nutrition_status ?? 'N/A',
                    $log->vitamin_a ? 'Yes' : 'No',
                    $log->deworming ? 'Yes' : 'No',
                    $log->micronutrient_powder ? 'Yes' : 'No',
                    $log->created_at ? Carbon::parse($log->created_at)->format('Y-m-d') : '',
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}
