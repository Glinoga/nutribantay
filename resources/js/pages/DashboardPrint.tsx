import { Head } from '@inertiajs/react';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

type PrintData = {
    healthlogs: Array<{
        child_name: string;
        birthdate: string;
        age: number;
        sex: string;
        weight: number;
        height: number;
        bmi: number;
        nutrition_status: string;
        vitamin_a: string;
        deworming: string;
        micronutrient_powder: string;
        last_visit: string;
    }>;
    summary: {
        total_children: number;
        period_start: string;
        period_end: string;
        nutrition_status: {
            normal: number;
            underweight: number;
            overweight: number;
            stunted: number;
        };
        vitamin_a_given: number;
        deworming_given: number;
    };
    barangay: string;
    generated_at: string;
    trends: {
        trend: Array<{ label: string; count: number }>;
        status_distribution: {
            normal: number;
            underweight: number;
            overweight: number;
            stunted: number;
        };
        vitamin_a_percentage: number;
        deworming_percentage: number;
    };
};

type DashboardPrintProps = {
    period: string;
    data: PrintData;
};

export default function DashboardPrint({ period, data }: DashboardPrintProps) {
    const lineChartData = {
        labels: data.trends.trend.map((t) => t.label),
        datasets: [
            {
                label: 'Health Logs',
                data: data.trends.trend.map((t) => t.count),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3,
            },
        ],
    };

    const barChartData = {
        labels: data.trends.trend.map((t) => t.label),
        datasets: [
            {
                label: 'Health Logs',
                data: data.trends.trend.map((t) => t.count),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
            },
        ],
    };

    const doughnutData = {
        labels: ['Normal', 'Underweight', 'Overweight', 'Stunted'],
        datasets: [
            {
                data: [
                    data.trends.status_distribution.normal,
                    data.trends.status_distribution.underweight,
                    data.trends.status_distribution.overweight,
                    data.trends.status_distribution.stunted,
                ],
                backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(234, 179, 8, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(249, 115, 22, 0.8)'],
                borderColor: ['rgb(34, 197, 94)', 'rgb(234, 179, 8)', 'rgb(239, 68, 68)', 'rgb(249, 115, 22)'],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="p-8">
            <Head title={`Print View - ${period}`} />

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                    .chart-container { break-inside: avoid; page-break-inside: avoid; }
                    table { break-inside: auto; }
                    tr { break-inside: avoid; page-break-inside: avoid; }
                }
            `}</style>

            <div className="no-print mb-6 flex items-center justify-between">
                <button onClick={() => window.print()} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Print
                </button>
                <a href="/dashboard" className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
                    Back to Dashboard
                </a>
            </div>

            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold">Nutribantay Dashboard Report</h1>
                <p className="text-lg">Barangay: {data.barangay}</p>
                <p className="text-lg capitalize">{period} Report</p>
                <p className="text-sm text-gray-600">
                    {data.summary.period_start} to {data.summary.period_end}
                </p>
            </div>

            {/* Summary Section */}
            <div className="mb-6">
                <h2 className="mb-3 text-lg font-semibold">Summary</h2>
                <table className="mb-4 w-full border-collapse border border-gray-300">
                    <tbody>
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 font-semibold">Total Children</td>
                            <td className="border border-gray-300 px-4 py-2">{data.summary.total_children}</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 font-semibold">Normal</td>
                            <td className="border border-gray-300 px-4 py-2">{data.summary.nutrition_status.normal}</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 font-semibold">Underweight</td>
                            <td className="border border-gray-300 px-4 py-2">{data.summary.nutrition_status.underweight}</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 font-semibold">Overweight</td>
                            <td className="border border-gray-300 px-4 py-2">{data.summary.nutrition_status.overweight}</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 font-semibold">Stunted</td>
                            <td className="border border-gray-300 px-4 py-2">{data.summary.nutrition_status.stunted}</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 font-semibold">Vitamin A Given</td>
                            <td className="border border-gray-300 px-4 py-2">
                                {data.summary.vitamin_a_given} ({data.trends.vitamin_a_percentage}%)
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 font-semibold">Deworming Given</td>
                            <td className="border border-gray-300 px-4 py-2">
                                {data.summary.deworming_given} ({data.trends.deworming_percentage}%)
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Trend Charts Section */}
            {data.trends.trend.length > 0 && (
                <div className="mb-6">
                    <h2 className="mb-3 text-lg font-semibold">Trends</h2>

                    <div className="chart-container grid grid-cols-1 gap-6 lg:grid-cols-2">
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

                    <div className="chart-container mt-6">
                        <div className="max-w-md rounded-lg bg-white p-4 shadow">
                            <h3 className="mb-2 font-semibold">Nutrition Status Distribution</h3>
                            {data.trends.status_distribution.normal +
                                data.trends.status_distribution.underweight +
                                data.trends.status_distribution.overweight +
                                data.trends.status_distribution.stunted >
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
            )}

            {/* Children Details Table */}
            <div className="mb-6">
                <h2 className="mb-3 text-lg font-semibold">Children Details</h2>
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-2 py-2 text-left">Name</th>
                            <th className="border border-gray-300 px-2 py-2 text-left">Birthday</th>
                            <th className="border border-gray-300 px-2 py-2 text-left">Age (months)</th>
                            <th className="border border-gray-300 px-2 py-2 text-left">Sex</th>
                            <th className="border border-gray-300 px-2 py-2 text-left">Weight (kg)</th>
                            <th className="border border-gray-300 px-2 py-2 text-left">Height (cm)</th>
                            <th className="border border-gray-300 px-2 py-2 text-left">Nutr. Status</th>
                            <th className="border border-gray-300 px-2 py-2 text-left">Vit. A</th>
                            <th className="border border-gray-300 px-2 py-2 text-left">Deworming</th>
                            <th className="border border-gray-300 px-2 py-2 text-left">MNP</th>
                            <th className="border border-gray-300 px-2 py-2 text-left">Last Visit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.healthlogs.map((log, index) => (
                            <tr key={index}>
                                <td className="border border-gray-300 px-2 py-2">{log.child_name}</td>
                                <td className="border border-gray-300 px-2 py-2">{log.birthdate}</td>
                                <td className="border border-gray-300 px-2 py-2">{log.age}</td>
                                <td className="border border-gray-300 px-2 py-2">{log.sex}</td>
                                <td className="border border-gray-300 px-2 py-2">{log.weight}</td>
                                <td className="border border-gray-300 px-2 py-2">{log.height}</td>
                                <td className="border border-gray-300 px-2 py-2">{log.nutrition_status}</td>
                                <td className="border border-gray-300 px-2 py-2">{log.vitamin_a}</td>
                                <td className="border border-gray-300 px-2 py-2">{log.deworming}</td>
                                <td className="border border-gray-300 px-2 py-2">{log.micronutrient_powder}</td>
                                <td className="border border-gray-300 px-2 py-2">{log.last_visit}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
                <p>Generated on {data.generated_at}</p>
                <p>Nutribantay - Nutrition Monitoring System</p>
            </div>
        </div>
    );
}
