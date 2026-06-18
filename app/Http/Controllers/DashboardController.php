<?php

namespace App\Http\Controllers;

use App\Jobs\RefreshDashboardForBarangay;
use App\Models\AuditLog;
use App\Models\DashboardCache;
use App\Models\HealthLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    private function getDateRange(string $period): array
    {
        $now = Carbon::now();

        return match ($period) {
            'daily' => [
                'start' => $now->copy()->startOfDay(),
                'end' => $now->copy()->endOfDay(),
            ],
            'weekly' => [
                'start' => $now->copy()->startOfWeek(),
                'end' => $now->copy()->endOfWeek(),
            ],
            'monthly' => [
                'start' => $now->copy()->startOfMonth(),
                'end' => $now->copy()->endOfMonth(),
            ],
            default => [
                'start' => $now->copy()->startOfYear(),
                'end' => $now->copy()->endOfYear(),
            ],
        };
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        $isAdmin = $user->hasRole('Admin');
        $barangay = $user->barangay;

        $cache = DashboardCache::where('barangay', $barangay)->first();

        if (! $cache) {
            RefreshDashboardForBarangay::dispatch($barangay);

            return Inertia::render('dashboard', [
                'stats' => [
                    'total_children' => 0,
                    'age_breakdown' => ['0to5' => 0, '6to11' => 0, '12to23' => 0, '24to56' => 0],
                    'nutrition_status' => ['normal' => 0, 'underweight' => 0, 'overweight' => 0, 'stunted' => 0],
                    'vitamin_a' => ['given' => 0, 'total' => 0, 'percentage' => 0],
                    'deworming' => ['given' => 0, 'total' => 0, 'percentage' => 0],
                    'daily' => ['children_registered' => 0, 'healthlogs' => 0],
                    'weekly' => ['healthlogs' => 0],
                    'monthly' => ['healthlogs' => 0],
                    'yearly' => ['healthlogs' => 0],
                ],
                'trends' => [
                    'monthly_6months' => [],
                    'monthly_1year' => [],
                    'status_distribution' => ['normal' => 0, 'underweight' => 0, 'overweight' => 0, 'stunted' => 0],
                ],
                'vaccine_followups' => [
                    'overdue_count' => 0,
                    'due_this_month_count' => 0,
                    'mixed_count' => 0,
                    'follow_ups' => [],
                ],
                'vitamin_followups' => [
                    'overdue_count' => 0,
                    'due_this_month_count' => 0,
                    'follow_ups' => [],
                ],
                'user_barangay' => $barangay,
                'is_admin' => $isAdmin,
            ]);
        }

        $nb = $cache->nutrition_breakdown ?? [];
        $ab = $cache->age_breakdown ?? [];
        $ml = $cache->monthly_logs ?? [];

        $months6 = collect($ml)->take(-6)->map(fn ($count, $month) => ['month' => $month, 'count' => $count])->values();
        $months12 = collect($ml)->map(fn ($count, $month) => ['month' => $month, 'count' => $count])->values();

        $totalWithLogs = $cache->total_with_logs;

        return Inertia::render('dashboard', [
            'stats' => [
                'total_children' => $cache->total_children,
                'age_breakdown' => [
                    '0to5' => $ab['0to5'] ?? 0,
                    '6to11' => $ab['6to11'] ?? 0,
                    '12to23' => $ab['12to23'] ?? 0,
                    '24to56' => $ab['24to56'] ?? 0,
                ],
                'nutrition_status' => [
                    'normal' => $nb['normal'] ?? 0,
                    'underweight' => $nb['underweight'] ?? 0,
                    'overweight' => $nb['overweight'] ?? 0,
                    'stunted' => $nb['stunted'] ?? 0,
                ],
                'vitamin_a' => [
                    'given' => $cache->vitamin_a_given,
                    'total' => $totalWithLogs,
                    'percentage' => $totalWithLogs > 0 ? round(($cache->vitamin_a_given / $totalWithLogs) * 100, 1) : 0,
                ],
                'deworming' => [
                    'given' => $cache->deworming_given,
                    'total' => $totalWithLogs,
                    'percentage' => $totalWithLogs > 0 ? round(($cache->deworming_given / $totalWithLogs) * 100, 1) : 0,
                ],
                'daily' => [
                    'children_registered' => $cache->today_children,
                    'healthlogs' => $cache->today_health_logs,
                ],
                'weekly' => [
                    'healthlogs' => $cache->week_health_logs,
                ],
                'monthly' => [
                    'healthlogs' => $cache->month_health_logs,
                ],
                'yearly' => [
                    'healthlogs' => $cache->year_health_logs,
                ],
            ],
            'trends' => [
                'monthly_6months' => $months6,
                'monthly_1year' => $months12,
                'status_distribution' => $nb,
            ],
            'vaccine_followups' => [
                'overdue_count' => $cache->vaccine_overdue,
                'due_this_month_count' => $cache->vaccine_upcoming,
                'mixed_count' => 0,
                'follow_ups' => [],
            ],
            'vitamin_followups' => [
                'overdue_count' => $cache->vitamin_overdue ?? 0,
                'due_this_month_count' => $cache->vitamin_upcoming ?? 0,
                'follow_ups' => [],
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

        AuditLog::logAction([
            'action' => 'exported',
            'model_type' => 'Dashboard',
            'description' => "Dashboard {$period} report exported by {$user->name}",
            'barangay' => $barangay,
        ]);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="dashboard_'.$period.'_'.date('Y-m-d').'.csv"',
        ];

        $callback = function () use ($barangay, $period, $range, $user) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Report Period', ucfirst($period)]);
            fputcsv($handle, ['Date Range', $range['start']->format('Y-m-d').' to '.$range['end']->format('Y-m-d')]);
            fputcsv($handle, ['Generated', Carbon::now()->format('Y-m-d H:i:s')]);
            fputcsv($handle, ['Generated By', $user->name]);
            fputcsv($handle, []);

            HealthLog::with(['child', 'user'])
                ->whereHas('child', fn ($q) => $q
                    ->where('barangay', $barangay)
                    ->where('birthdate', '>=', now()->subMonths(60)))
                ->whereBetween('created_at', [$range['start'], $range['end']])
                ->orderBy('created_at', 'desc')
                ->chunk(200, function ($healthlogs) use ($handle) {
                    static $headerWritten = false;

                    if (! $headerWritten) {
                        fputcsv($handle, [
                            'ID', 'Child Name', 'Birthday', 'Age (Months)', 'Sex',
                            'Weight (kg)', 'Height (cm)', 'Nutrition Status',
                            'Vitamin A', 'Deworming', 'MNP', 'Last Visit',
                        ]);
                        $headerWritten = true;
                    }

                    foreach ($healthlogs as $log) {
                        fputcsv($handle, [
                            $log->id,
                            $log->child->fullname ?? '',
                            $log->child->birthdate ? Carbon::parse($log->child->birthdate)->format('Y-m-d') : '',
                            $log->age_in_months ?? ($log->child->birthdate ? floor(Carbon::parse($log->child->birthdate)->diffInMonths(Carbon::now())) : ''),
                            $log->child->sex ?? '',
                            $log->weight ?? '',
                            $log->height ?? '',
                            $log->nutrition_status ?? 'N/A',
                            $log->vitamin_a ? 'Yes' : 'No',
                            $log->deworming ? 'Yes' : 'No',
                            $log->micronutrient_powder ? 'Yes' : 'No',
                            $log->created_at ? Carbon::parse($log->created_at)->format('Y-m-d') : '',
                        ]);
                    }
                });

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function printView(Request $request)
    {
        $period = $request->period ?? 'monthly';
        $range = $this->getDateRange($period);

        $user = auth()->user();
        $barangay = $user->barangay;

        AuditLog::logAction([
            'action' => 'printed',
            'model_type' => 'Dashboard',
            'description' => "Dashboard {$period} report printed by {$user->name}",
            'barangay' => $barangay,
        ]);

        $healthLogs = HealthLog::with(['child', 'user'])
            ->whereHas('child', fn ($q) => $q
                ->where('barangay', $barangay)
                ->where('birthdate', '>=', now()->subMonths(60)))
            ->where('created_at', '>=', $range['start'])
            ->where('created_at', '<=', $range['end'])
            ->latest('created_at')
            ->get()
            ->groupBy('child_id')
            ->map(fn ($logs) => $logs->first());

        $totalChildren = $healthLogs->count();

        // All health logs in period for trend data (count of visits over time)
        $allLogs = HealthLog::whereHas('child', fn ($q) => $q
            ->where('barangay', $barangay)
            ->where('birthdate', '>=', now()->subMonths(60)))
            ->where('created_at', '>=', $range['start'])
            ->where('created_at', '<=', $range['end'])
            ->get();

        $trend = [];
        if ($allLogs->isNotEmpty()) {
            $grouped = match ($period) {
                'daily' => $allLogs->groupBy(fn ($log) => $log->created_at->format('Y-m-d H:00')),
                'weekly' => $allLogs->groupBy(fn ($log) => $log->created_at->format('Y-m-d')),
                'monthly' => $allLogs->groupBy(fn ($log) => $log->created_at->format('o-W')),
                default => $allLogs->groupBy(fn ($log) => $log->created_at->format('Y-m')),
            };

            foreach ($grouped as $key => $logs) {
                $label = match ($period) {
                    'daily' => Carbon::parse($key)->format('g A'),
                    'weekly' => Carbon::parse($key)->format('D M d'),
                    'monthly' => 'Week '.substr($key, 5),
                    default => Carbon::parse($key.'-01')->format('M Y'),
                };
                $trend[] = ['label' => $label, 'count' => $logs->count()];
            }
        }

        $trends = [
            'trend' => $trend,
            'status_distribution' => [
                'normal' => $healthLogs->where('nutrition_status', 'Normal')->count(),
                'underweight' => $healthLogs->whereIn('nutrition_status', ['Underweight', 'Moderate Malnutrition', 'Severe Malnutrition'])->count(),
                'overweight' => $healthLogs->whereIn('nutrition_status', ['Overweight', 'Obese'])->count(),
                'stunted' => $healthLogs->whereIn('nutrition_status', ['Stunted', 'Severely Stunted'])->count(),
            ],
            'vitamin_a_percentage' => $totalChildren > 0 ? round(($healthLogs->where('vitamin_a', true)->count() / $totalChildren) * 100) : 0,
            'deworming_percentage' => $totalChildren > 0 ? round(($healthLogs->where('deworming', true)->count() / $totalChildren) * 100) : 0,
        ];

        return Inertia::render('DashboardPrint', [
            'period' => $period,
            'data' => [
                'healthlogs' => $healthLogs->values()->map(fn ($log) => [
                    'child_name' => $log->child->fullname ?? '',
                    'birthdate' => $log->child->birthdate ? Carbon::parse($log->child->birthdate)->format('Y-m-d') : '',
                    'age' => $log->age_in_months ?? ($log->child->birthdate ? floor(Carbon::parse($log->child->birthdate)->diffInMonths(Carbon::now())) : ''),
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
                    'nutrition_status' => [
                        'normal' => $healthLogs->where('nutrition_status', 'Normal')->count(),
                        'underweight' => $healthLogs->whereIn('nutrition_status', ['Underweight', 'Moderate Malnutrition', 'Severe Malnutrition'])->count(),
                        'overweight' => $healthLogs->whereIn('nutrition_status', ['Overweight', 'Obese'])->count(),
                        'stunted' => $healthLogs->whereIn('nutrition_status', ['Stunted', 'Severely Stunted'])->count(),
                    ],
                    'vitamin_a_given' => $healthLogs->where('vitamin_a', true)->count(),
                    'deworming_given' => $healthLogs->where('deworming', true)->count(),
                ],
                'barangay' => $barangay,
                'generated_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'generated_by' => $user->name,
                'trends' => $trends,
            ],
        ]);
    }
}
