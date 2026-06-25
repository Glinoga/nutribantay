<?php

namespace App\Http\Controllers;

use App\Jobs\RefreshDashboardForBarangay;
use App\Models\AuditLog;
use App\Models\Child;
use App\Models\DashboardCache;
use App\Models\HealthLog;
use App\Services\NutStatusExportService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

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
                    'nutrition_status' => ['normal' => 0, 'underweight' => 0, 'overweight' => 0, 'stunted' => 0, 'wasted' => 0],
                    'vitamin_a' => ['given' => 0, 'total' => 0],
                    'deworming' => ['given' => 0, 'total' => 0],
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
                    'wasted' => $nb['wasted'] ?? 0,
                ],
                'vitamin_a' => [
                    'given' => $cache->vitamin_a_given,
                    'total' => $cache->total_with_logs,
                ],
                'deworming' => [
                    'given' => $cache->deworming_given,
                    'total' => $cache->total_with_logs,
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
        $user = auth()->user();
        $barangay = $user->barangay;

        // ── Date Range ──
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $startDate = Carbon::parse($request->start_date)->startOfDay();
            $endDate = Carbon::parse($request->end_date)->endOfDay();
            $period = $request->start_date.'_to_'.$request->end_date;
            $range = ['start' => $startDate, 'end' => $endDate];
        } else {
            $period = $request->period ?? 'monthly';
            $range = $this->getDateRange($period);
        }

        AuditLog::logAction([
            'action' => 'exported',
            'model_type' => 'Dashboard',
            'description' => "Dashboard {$period} report exported by {$user->name}",
            'barangay' => $barangay,
        ]);

        // ── Build query ──
        $query = Child::with('latestHealthlog')
            ->where('barangay', $barangay)
            ->where('birthdate', '>=', now()->subMonths(60));

        // Sex filter
        if ($request->filled('sex')) {
            $sexes = explode(',', $request->sex);
            $query->whereIn('sex', $sexes);
        }

        // IP Group filter
        if ($request->filled('belongs_to_ip')) {
            $query->where('belongs_to_ip', $request->belongs_to_ip);
        }

        // Age group filter
        if ($request->filled('age_group')) {
            $groups = explode(',', $request->age_group);
            $query->where(function ($q) use ($groups) {
                foreach ($groups as $group) {
                    $q->orWhereRaw(
                        match ($group) {
                            '0to5' => 'birthdate BETWEEN ? AND ?',
                            '6to11' => 'birthdate BETWEEN ? AND ?',
                            '12to23' => 'birthdate BETWEEN ? AND ?',
                            '24to59' => 'birthdate BETWEEN ? AND ?',
                            default => null,
                        },
                        match ($group) {
                            '0to5' => [now()->subMonths(5)->startOfMonth(), now()],
                            '6to11' => [now()->subMonths(11)->startOfMonth(), now()->subMonths(5)->endOfMonth()],
                            '12to23' => [now()->subMonths(23)->startOfMonth(), now()->subMonths(11)->endOfMonth()],
                            '24to59' => [now()->subMonths(59)->startOfMonth(), now()->subMonths(23)->endOfMonth()],
                            default => [now(), now()],
                        }
                    );
                }
            });
        }

        // Nutrition status filter (on latest healthlog)
        if ($request->filled('status')) {
            $statuses = explode(',', $request->status);
            $query->whereHas('healthlogs', function ($q) use ($statuses) {
                $q->whereIn('nutrition_status', $statuses)
                    ->whereIn('id', function ($sub) {
                        $sub->selectRaw('MAX(id)')->from('health_logs')->whereColumn('child_id', 'children.id');
                    });
            });
        }

        // Indicator filters (WFA, LFA, WFH)
        $statusFieldMap = ['wfa' => 'status_wfa', 'lfa' => 'status_lfa', 'wfh' => 'status_wfl_wfh'];
        foreach (['wfa', 'lfa', 'wfh'] as $indicator) {
            if ($request->filled($indicator)) {
                $values = explode(',', $request->{$indicator});
                $field = $statusFieldMap[$indicator];
                $query->whereHas('healthlogs', function ($q) use ($field, $values) {
                    $q->whereIn($field, $values)
                        ->whereIn('id', function ($sub) {
                            $sub->selectRaw('MAX(id)')->from('health_logs')->whereColumn('child_id', 'children.id');
                        });
                });
            }
        }

        // Scope to health logs in date range (only children seen in that period)
        $query->whereHas('healthlogs', function ($q) use ($range) {
            $q->whereBetween('created_at', [$range['start'], $range['end']]);
        });

        $children = $query->get();

        // ── Generate xlsx ──
        $service = new NutStatusExportService;
        $spreadsheet = $service->generate($children, [
            'barangay' => $barangay,
            'city' => config('app.city', 'Caloocan'),
            'generated_by' => $user->name,
            'generated_at' => Carbon::now()->format('Y-m-d H:i:s'),
        ]);

        $writer = new Xlsx($spreadsheet);
        $filename = "Nut_StatusTool_{$barangay}_{$period}_".date('Y-m-d').'.xlsx';

        ob_start();
        $writer->save('php://output');
        $content = ob_get_clean();

        return response($content, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
            'Cache-Control' => 'max-age=0',
        ]);
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

        $allLogs = HealthLog::with(['child', 'user'])
            ->whereHas('child', fn ($q) => $q
                ->where('barangay', $barangay)
                ->where('birthdate', '>=', now()->subMonths(60)))
            ->where('created_at', '>=', $range['start'])
            ->where('created_at', '<=', $range['end'])
            ->get();

        $groupedByChild = $allLogs->groupBy('child_id');

        $totalChildren = $groupedByChild->count();

        $latestPerChild = $groupedByChild->map(fn ($logs) => $logs->sortByDesc('created_at')->first());

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
                'normal' => $latestPerChild->where('nutrition_status', 'Normal')->count(),
                'underweight' => $latestPerChild->whereIn('nutrition_status', ['Underweight', 'Moderate Malnutrition', 'Severe Malnutrition'])->count(),
                'overweight' => $latestPerChild->filter(fn ($l) => $l->nutrition_status === 'Overweight/Obese' || in_array($l->status_wfl_wfh, ['Overweight', 'Obese']))->count(),
                'stunted' => $latestPerChild->filter(fn ($l) => in_array($l->status_lfa, ['Stunted', 'Severely Stunted']))->count(),
                'wasted' => $latestPerChild->filter(fn ($l) => in_array($l->status_wfl_wfh, ['Wasted', 'Severely Wasted']))->count(),
            ],
            'vitamin_a_doses' => $allLogs->where('vitamin_a', true)->count(),
            'deworming_doses' => $allLogs->where('deworming', true)->count(),
        ];

        return Inertia::render('DashboardPrint', [
            'period' => $period,
            'data' => [
                'healthlogs' => $groupedByChild->map(function ($logs, $childId) {
                    $latest = $logs->sortByDesc('created_at')->first();
                    $child = $logs->first()->child;

                    return [
                        'child_name' => $child->fullname ?? '',
                        'birthdate' => $child->birthdate ? Carbon::parse($child->birthdate)->format('Y-m-d') : '',
                        'age' => $latest->age_in_months ?? ($child->birthdate ? floor(Carbon::parse($child->birthdate)->diffInMonths(Carbon::now())) : ''),
                        'sex' => $child->sex ?? '',
                        'weight' => $latest->weight,
                        'height' => $latest->height,
                        'bmi' => $latest->bmi,
                        'nutrition_status' => $latest->nutrition_status ?? 'N/A',
                        'status_wfa' => $latest->status_wfa ?? '-',
                        'status_lfa' => $latest->status_lfa ?? '-',
                        'status_wfl_wfh' => $latest->status_wfl_wfh ?? '-',
                        'vitamin_a' => $logs->where('vitamin_a', true)->count(),
                        'deworming' => $logs->where('deworming', true)->count(),
                        'micronutrient_powder' => $logs->filter(fn ($l) => ! empty($l->micronutrient_powder))->count(),
                        'last_visit' => $latest->created_at ? Carbon::parse($latest->created_at)->format('Y-m-d') : '',
                    ];
                })->values()->all(),
                'summary' => [
                    'total_children' => $totalChildren,
                    'period_start' => $range['start']->format('Y-m-d'),
                    'period_end' => $range['end']->format('Y-m-d'),
                    'nutrition_status' => [
                        'normal' => $latestPerChild->where('nutrition_status', 'Normal')->count(),
                        'underweight' => $latestPerChild->whereIn('nutrition_status', ['Underweight', 'Moderate Malnutrition', 'Severe Malnutrition'])->count(),
                        'overweight' => $latestPerChild->filter(fn ($l) => $l->nutrition_status === 'Overweight/Obese' || in_array($l->status_wfl_wfh, ['Overweight', 'Obese']))->count(),
                        'stunted' => $latestPerChild->filter(fn ($l) => in_array($l->status_lfa, ['Stunted', 'Severely Stunted']))->count(),
                        'wasted' => $latestPerChild->filter(fn ($l) => in_array($l->status_wfl_wfh, ['Wasted', 'Severely Wasted']))->count(),
                    ],
                    'vitamin_a_given' => $allLogs->where('vitamin_a', true)->count(),
                    'deworming_given' => $allLogs->where('deworming', true)->count(),
                ],
                'barangay' => $barangay,
                'generated_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'generated_by' => $user->name,
                'trends' => $trends,
            ],
        ]);
    }
}
