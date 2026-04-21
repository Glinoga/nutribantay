import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

type Stats = {
    total_children: number;
    age_breakdown: {
        '0to5': number;
        '6to11': number;
        '12to35': number;
        '36plus': number;
    };
    nutrition_status: {
        normal: number;
        underweight: number;
        overweight: number;
        stunted: number;
    };
    vitamin_a: {
        given: number;
        total: number;
        percentage: number;
    };
    deworming: {
        given: number;
        total: number;
        percentage: number;
    };
    daily: {
        children_registered: number;
        healthlogs: number;
    };
    weekly: {
        healthlogs: number;
    };
    monthly: {
        healthlogs: number;
    };
    yearly: {
        healthlogs: number;
    };
};

type DashboardProps = {
    stats: Stats;
    user_barangay: string;
    is_admin: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ stats, user_barangay, is_admin }: DashboardProps) {
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printPeriod, setPrintPeriod] = useState('monthly');

    const handlePrint = () => {
        window.open(`/dashboard/print?period=${printPeriod}`, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <p className="text-gray-600">Barangay: {user_barangay}</p>
                    </div>
                    <button onClick={() => setShowPrintModal(true)} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        Export / Print
                    </button>
                </div>

                {/* Daily Stats */}
                <div className="mb-6">
                    <h2 className="mb-3 text-lg font-semibold">Daily Stats</h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-lg bg-white p-4 shadow">
                            <p className="text-sm text-gray-500">Children Registered Today</p>
                            <p className="text-2xl font-bold">{stats.daily.children_registered}</p>
                        </div>
                        <div className="rounded-lg bg-white p-4 shadow">
                            <p className="text-sm text-gray-500">Health Logs Today</p>
                            <p className="text-2xl font-bold">{stats.daily.healthlogs}</p>
                        </div>
                        <div className="rounded-lg bg-white p-4 shadow">
                            <p className="text-sm text-gray-500">This Week</p>
                            <p className="text-2xl font-bold">{stats.weekly.healthlogs}</p>
                        </div>
                        <div className="rounded-lg bg-white p-4 shadow">
                            <p className="text-sm text-gray-500">This Month</p>
                            <p className="text-2xl font-bold">{stats.monthly.healthlogs}</p>
                        </div>
                    </div>
                </div>

                {/* Total Children */}
                <div className="mb-6">
                    <div className="rounded-lg bg-blue-600 p-6 text-white">
                        <p className="text-sm opacity-80">Total Children Registered</p>
                        <p className="text-4xl font-bold">{stats.total_children}</p>
                    </div>
                </div>

                {/* Age Breakdown */}
                <div className="mb-6">
                    <h2 className="mb-3 text-lg font-semibold">Age Breakdown</h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-lg bg-white p-4 shadow">
                            <p className="text-sm text-gray-500">0-5 months</p>
                            <p className="text-2xl font-bold">{stats.age_breakdown['0to5']}</p>
                        </div>
                        <div className="rounded-lg bg-white p-4 shadow">
                            <p className="text-sm text-gray-500">6-11 months</p>
                            <p className="text-2xl font-bold">{stats.age_breakdown['6to11']}</p>
                        </div>
                        <div className="rounded-lg bg-white p-4 shadow">
                            <p className="text-sm text-gray-500">12-35 months</p>
                            <p className="text-2xl font-bold">{stats.age_breakdown['12to35']}</p>
                        </div>
                        <div className="rounded-lg bg-orange-100 p-4 shadow">
                            <p className="text-sm text-orange-600">36+ months (No longer in bracket)</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.age_breakdown['36plus']}</p>
                        </div>
                    </div>
                </div>

                {/* Nutrition Status */}
                <div className="mb-6">
                    <h2 className="mb-3 text-lg font-semibold">Nutrition Status (This Year)</h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-lg bg-green-100 p-4 shadow">
                            <p className="text-sm text-green-600">Normal</p>
                            <p className="text-2xl font-bold text-green-600">{stats.nutrition_status.normal}</p>
                        </div>
                        <div className="rounded-lg bg-yellow-100 p-4 shadow">
                            <p className="text-sm text-yellow-600">Underweight</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.nutrition_status.underweight}</p>
                        </div>
                        <div className="rounded-lg bg-red-100 p-4 shadow">
                            <p className="text-sm text-red-600">Overweight</p>
                            <p className="text-2xl font-bold text-red-600">{stats.nutrition_status.overweight}</p>
                        </div>
                        <div className="rounded-lg bg-orange-100 p-4 shadow">
                            <p className="text-sm text-orange-600">Stunted</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.nutrition_status.stunted}</p>
                        </div>
                    </div>
                </div>

                {/* Coverage */}
                <div className="mb-6">
                    <h2 className="mb-3 text-lg font-semibold">Coverage (Vitamin A & Deworming)</h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-lg bg-white p-4 shadow">
                            <p className="text-sm text-gray-500">Vitamin A Given</p>
                            <p className="text-2xl font-bold">{stats.vitamin_a.given}</p>
                            <p className="text-sm text-gray-500">({stats.vitamin_a.percentage}%)</p>
                        </div>
                        <div className="rounded-lg bg-white p-4 shadow">
                            <p className="text-sm text-gray-500">Deworming Given</p>
                            <p className="text-2xl font-bold">{stats.deworming.given}</p>
                            <p className="text-sm text-gray-500">({stats.deworming.percentage}%)</p>
                        </div>
                        <div className="rounded-lg bg-white p-4 shadow">
                            <p className="text-sm text-gray-500">Total Measured</p>
                            <p className="text-2xl font-bold">{stats.vitamin_a.total}</p>
                        </div>
                        <div className="rounded-lg bg-white p-4 shadow">
                            <p className="text-sm text-gray-500">Health Logs This Year</p>
                            <p className="text-2xl font-bold">{stats.yearly.healthlogs}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print/Export Modal */}
            {showPrintModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6">
                        <h2 className="mb-4 text-xl font-bold">Export / Print</h2>
                        <p className="mb-4 text-gray-600">Select time period for export:</p>

                        <div className="mb-4 space-y-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="period"
                                    value="daily"
                                    checked={printPeriod === 'daily'}
                                    onChange={() => setPrintPeriod('daily')}
                                />
                                <span>Daily</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="period"
                                    value="weekly"
                                    checked={printPeriod === 'weekly'}
                                    onChange={() => setPrintPeriod('weekly')}
                                />
                                <span>Weekly</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="period"
                                    value="monthly"
                                    checked={printPeriod === 'monthly'}
                                    onChange={() => setPrintPeriod('monthly')}
                                />
                                <span>Monthly</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="period"
                                    value="yearly"
                                    checked={printPeriod === 'yearly'}
                                    onChange={() => setPrintPeriod('yearly')}
                                />
                                <span>Yearly</span>
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={handlePrint} className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                                Print View
                            </button>
                            <button
                                onClick={() => {
                                    window.location.href = `/dashboard/export?period=${printPeriod}`;
                                }}
                                className="flex-1 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                            >
                                Export CSV
                            </button>
                            <button onClick={() => setShowPrintModal(false)} className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
