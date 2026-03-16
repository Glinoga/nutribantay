<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\DashboardMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // --- Stats ---
        $totalChildren = Child::count();

        // Underweight: weight < (age * 2 + 7) — adjust threshold as needed
        $underweightCases = Child::whereNotNull('weight')
            ->whereNotNull('age')
            ->whereRaw('weight < (age * 2 + 7)')
            ->count();

        // Vaccinated count — now uses the real vaccinated column
        $childrenVaccinated = Child::where('vaccinated', true)->count();

        // --- Growth Trends (registered children by year) ---
        $growthRaw = Child::selectRaw('YEAR(created_at) as year, COUNT(*) as total')
            ->whereNotNull('created_at')
            ->groupBy('year')
            ->orderBy('year')
            ->get();

        $growthLabels = $growthRaw->pluck('year')->map(fn($y) => (string) $y)->toArray();
        $growthData   = $growthRaw->pluck('total')->toArray();

        // Fallback to static data if no records yet
        if (empty($growthLabels)) {
            $growthLabels = ['1980','1985','1990','1995','2000','2005','2010','2015','2020','2025'];
            $growthData   = [20000,40000,50000,70000,90000,120000,140000,160000,180000,$totalChildren];
        }

        // --- Malnutrition Cases by barangay (top 6 by registered count) ---
        $topBarangays = Child::selectRaw('barangay, COUNT(*) as total')
            ->whereNotNull('barangay')
            ->groupBy('barangay')
            ->orderByDesc('total')
            ->limit(6)
            ->pluck('barangay')
            ->toArray();

        $cases2023 = [];
        $cases2024 = [];
        foreach ($topBarangays as $barangay) {
            $cases2023[] = Child::where('barangay', $barangay)
                ->whereYear('created_at', 2023)
                ->whereNotNull('weight')
                ->whereNotNull('age')
                ->whereRaw('weight < (age * 2 + 7)')
                ->count();

            $cases2024[] = Child::where('barangay', $barangay)
                ->whereYear('created_at', 2024)
                ->whereNotNull('weight')
                ->whereNotNull('age')
                ->whereRaw('weight < (age * 2 + 7)')
                ->count();
        }

        // Fallback if no barangay data yet
        if (empty($topBarangays)) {
            $topBarangays = ['No data'];
            $cases2023    = [0];
            $cases2024    = [0];
        }

        // --- Dashboard Quick Messages ---
        $dashboardMessages = DashboardMessage::latest()
            ->take(20)
            ->get(['id', 'message', 'created_at']);

        return Inertia::render('Dashboard', [
            'totalChildren'      => $totalChildren,
            'underweightCases'   => $underweightCases,
            'childrenVaccinated' => $childrenVaccinated,
            'growthData'         => [
                'labels' => $growthLabels,
                'data'   => $growthData,
            ],
            'malnutritionData'   => [
                'labels'    => $topBarangays,
                'cases2023' => $cases2023,
                'cases2024' => $cases2024,
            ],
            'dashboardMessages'  => $dashboardMessages,
        ]);
    }
}