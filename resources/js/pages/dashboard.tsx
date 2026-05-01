import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

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

type TrendData = {
    monthly_6months: Array<{ month: string; count: number }>;
    monthly_1year: Array<{ month: string; count: number }>;
    status_distribution: {
        normal: number;
        underweight: number;
        overweight: number;
        stunted: number;
    };
};

type VaccineFollowup = {
    child_id: number;
    child_name: string;
    vaccine_name: string;
    dose_number: number;
    next_due_date: string;
    status: 'Overdue' | 'Upcoming';
};

type VaccineFollowups = {
    overdue_count: number;
    due_this_month_count: number;
    follow_ups: VaccineFollowup[];
};

type DashboardProps = {
    stats: Stats;
    trends: TrendData;
    vaccine_followups: VaccineFollowups;
    user_barangay: string;
    is_admin: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ stats, trends, vaccine_followups, user_barangay }: DashboardProps) {
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printPeriod, setPrintPeriod] = useState('monthly');
    const [trendRange, setTrendRange] = useState<'6months' | '1year'>('6months');

    const handlePrint = () => {
        window.open(`/dashboard/print?period=${printPeriod}`, '_blank');
    };

    const trendData = trendRange === '6months' ? trends.monthly_6months : trends.monthly_1year;

    const lineChartData = {
        labels: trendData.map((t) => t.month),
        datasets: [
            {
                label: 'Health Logs',
                data: trendData.map((t) => t.count),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3,
            },
        ],
    };

    const barChartData = {
        labels: trendData.map((t) => t.month),
        datasets: [
            {
                label: 'Health Logs',
                data: trendData.map((t) => t.count),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
            },
        ],
    };

    const doughnutData = {
        labels: ['Normal', 'Underweight', 'Overweight', 'Stunted'],
        datasets: [
            {
                data: [
                    trends.status_distribution.normal,
                    trends.status_distribution.underweight,
                    trends.status_distribution.overweight,
                    trends.status_distribution.stunted,
                ],
                backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(234, 179, 8, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(249, 115, 22, 0.8)'],
                borderColor: ['rgb(34, 197, 94)', 'rgb(234, 179, 8)', 'rgb(239, 68, 68)', 'rgb(249, 115, 22)'],
                borderWidth: 1,
            },
        ],
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <p className="text-gray-600">Barangay: {user_barangay}</p>
                    </div>
                    <button onClick={() => setShowPrintModal(true)} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        Export / Print
                    </button>
                </div>

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

                <div className="mb-6">
                    <div className="rounded-lg bg-blue-600 p-6 text-white">
                        <p className="text-sm opacity-80">Total Children Registered</p>
                        <p className="text-4xl font-bold">{stats.total_children}</p>
                    </div>
                </div>

                {vaccine_followups.overdue_count > 0 || vaccine_followups.due_this_month_count > 0 ? (
                    <div className="mb-6">
                        <div className="rounded-lg border border-amber-200 bg-amber-50 shadow">
                            <div className="flex items-center justify-between border-b border-amber-200 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                        />
                                    </svg>
                                    <div>
                                        <h2 className="text-lg font-semibold text-amber-900">Vaccine Follow-ups Needed</h2>
                                        <p className="text-sm text-amber-700">
                                            {vaccine_followups.overdue_count > 0 && (
                                                <span className="font-medium text-red-700">{vaccine_followups.overdue_count} overdue</span>
                                            )}
                                            {vaccine_followups.overdue_count > 0 && vaccine_followups.due_this_month_count > 0 && <span>, </span>}
                                            {vaccine_followups.due_this_month_count > 0 && (
                                                <span className="font-medium text-amber-700">
                                                    {vaccine_followups.due_this_month_count} due this month
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href="/children?vaccine_status=overdue"
                                        className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                                    >
                                        View Overdue
                                    </Link>
                                    <Link
                                        href="/children?vaccine_status=upcoming"
                                        className="rounded bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700"
                                    >
                                        View Upcoming
                                    </Link>
                                </div>
                            </div>
                            {vaccine_followups.follow_ups.length > 0 && (
                                <div className="max-h-64 overflow-y-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-amber-100/50">
                                            <tr>
                                                <th className="px-6 py-2 text-left font-medium text-amber-800">Child</th>
                                                <th className="px-6 py-2 text-left font-medium text-amber-800">Vaccine</th>
                                                <th className="px-6 py-2 text-left font-medium text-amber-800">Dose #</th>
                                                <th className="px-6 py-2 text-left font-medium text-amber-800">Due Date</th>
                                                <th className="px-6 py-2 text-left font-medium text-amber-800">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vaccine_followups.follow_ups.slice(0, 10).map((fu, idx) => (
                                                <tr key={idx} className="border-t border-amber-100">
                                                    <td className="px-6 py-2">
                                                        <Link href={`/children/${fu.child_id}`} className="text-blue-600 hover:underline">
                                                            {fu.child_name}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-2">{fu.vaccine_name}</td>
                                                    <td className="px-6 py-2">{fu.dose_number}</td>
                                                    <td className="px-6 py-2">{fu.next_due_date}</td>
                                                    <td className="px-6 py-2">
                                                        <span
                                                            className={`rounded px-2 py-0.5 text-xs font-medium ${
                                                                fu.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                            }`}
                                                        >
                                                            {fu.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {vaccine_followups.follow_ups.length > 10 && (
                                        <div className="border-t border-amber-100 px-6 py-2 text-center text-sm text-amber-600">
                                            ...and {vaccine_followups.follow_ups.length - 10} more
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}

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
                            <p className="text-sm text-orange-600">36+ months</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.age_breakdown['36plus']}</p>
                        </div>
                    </div>
                </div>

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

                <div className="mb-6">
                    <h2 className="mb-3 text-lg font-semibold">Coverage</h2>
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

                {/* Trend Charts Section */}
                <div className="mb-6">
                    <h2 className="mb-3 text-lg font-semibold">Trends</h2>

                    <div className="mb-4 flex gap-2">
                        <button
                            onClick={() => setTrendRange('6months')}
                            className={`rounded px-4 py-2 ${trendRange === '6months' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            Last 6 Months
                        </button>
                        <button
                            onClick={() => setTrendRange('1year')}
                            className={`rounded px-4 py-2 ${trendRange === '1year' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            Last Year
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-lg bg-white p-4 shadow">
                            <h3 className="mb-2 font-semibold">Health Logs Over Time</h3>
                            <Line
                                data={lineChartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { position: 'bottom' },
                                    },
                                }}
                            />
                        </div>

                        <div className="rounded-lg bg-white p-4 shadow">
                            <h3 className="mb-2 font-semibold">Monthly Comparison</h3>
                            <Bar
                                data={barChartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { position: 'bottom' },
                                    },
                                }}
                            />
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-lg bg-white p-4 shadow">
                            <h3 className="mb-2 font-semibold">Nutrition Status Distribution (Last 6 Months)</h3>
                            {trends.status_distribution.normal +
                                trends.status_distribution.underweight +
                                trends.status_distribution.overweight +
                                trends.status_distribution.stunted >
                            0 ? (
                                <Doughnut
                                    data={doughnutData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: 'bottom' },
                                        },
                                    }}
                                />
                            ) : (
                                <p className="text-gray-500">No nutrition status data available.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

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
