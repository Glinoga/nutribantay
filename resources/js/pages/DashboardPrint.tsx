import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Head, Link } from '@inertiajs/react';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { ArrowLeft, Baby, BarChart3, PieChart, Printer, TrendingUp } from 'lucide-react';
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
                borderColor: '#0891B2',
                backgroundColor: 'rgba(8, 145, 178, 0.5)',
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
                backgroundColor: 'rgba(8, 145, 178, 0.7)',
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
                backgroundColor: ['rgba(5, 150, 105, 0.8)', 'rgba(234, 179, 8, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(249, 115, 22, 0.8)'],
                borderColor: ['rgb(5, 150, 105)', 'rgb(234, 179, 8)', 'rgb(239, 68, 68)', 'rgb(249, 115, 22)'],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-cyan-50 p-8 font-sans print:bg-white">
            <Head title={`Nutribantay Dashboard Report - ${period}`} />

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                    .chart-container { break-inside: avoid; page-break-inside: avoid; }
                    table { break-inside: auto; }
                    tr { break-inside: avoid; page-break-inside: avoid; }
                }
            `}</style>

            {/* Print Controls */}
            <div className="no-print mb-8 flex items-center justify-between">
                <Button
                    onClick={() => window.print()}
                    className="cursor-pointer bg-gradient-to-r from-cyan-600 to-cyan-400 text-white shadow-md transition-all duration-200 hover:from-cyan-700 hover:to-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
                >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Report
                </Button>
                <Link href="/dashboard">
                    <Button
                        variant="outline"
                        className="cursor-pointer border-cyan-300 transition-all duration-200 hover:bg-cyan-50 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>

            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="mb-4 text-3xl font-bold text-cyan-900">Nutribantay</h1>
                <h2 className="text-2xl font-bold text-cyan-900">Dashboard Report</h2>
                <p className="mt-2 text-lg text-cyan-700">Barangay: {data.barangay}</p>
                <p className="text-lg text-cyan-600 capitalize">{period} Report</p>
                <p className="mt-1 text-sm text-cyan-700">
                    {data.summary.period_start} to {data.summary.period_end}
                </p>
            </div>

            {/* Summary Section */}
            <div className="mb-8">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-cyan-900">
                    <TrendingUp className="h-5 w-5 text-cyan-600" />
                    Summary Statistics
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="print:bg-white">
                        <CardHeader>
                            <CardDescription>Total Children</CardDescription>
                            <CardTitle className="text-3xl text-cyan-600">{data.summary.total_children}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-green-200 bg-green-50 print:bg-white">
                        <CardHeader>
                            <CardDescription className="text-green-600">Normal</CardDescription>
                            <CardTitle className="text-3xl text-green-600">{data.summary.nutrition_status.normal}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-yellow-200 bg-yellow-50 print:bg-white">
                        <CardHeader>
                            <CardDescription className="text-yellow-600">Underweight</CardDescription>
                            <CardTitle className="text-3xl text-yellow-600">{data.summary.nutrition_status.underweight}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-red-200 bg-red-50 print:bg-white">
                        <CardHeader>
                            <CardDescription className="text-red-600">Overweight</CardDescription>
                            <CardTitle className="text-3xl text-red-600">{data.summary.nutrition_status.overweight}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-orange-200 bg-orange-50 print:bg-white">
                        <CardHeader>
                            <CardDescription className="text-orange-600">Stunted</CardDescription>
                            <CardTitle className="text-3xl text-orange-600">{data.summary.nutrition_status.stunted}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="print:bg-white">
                        <CardHeader>
                            <CardDescription>Vitamin A Given</CardDescription>
                            <CardTitle className="text-3xl text-cyan-900">
                                {data.summary.vitamin_a_given}
                                <span className="ml-2 text-sm font-normal text-cyan-700">({data.trends.vitamin_a_percentage}%)</span>
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="print:bg-white">
                        <CardHeader>
                            <CardDescription>Deworming Given</CardDescription>
                            <CardTitle className="text-3xl text-cyan-900">
                                {data.summary.deworming_given}
                                <span className="ml-2 text-sm font-normal text-cyan-700">({data.trends.deworming_percentage}%)</span>
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            </div>

            {/* Trend Charts Section */}
            {data.trends.trend.length > 0 && (
                <div className="mb-8">
                    <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-cyan-900">
                        <BarChart3 className="h-5 w-5 text-cyan-600" />
                        Trends
                    </h3>

                    <div className="chart-container grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Card className="print:bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg text-cyan-900">Health Logs Over Time</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Line
                                    data={lineChartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: 'bottom' },
                                        },
                                    }}
                                    aria-label="Line chart showing health logs over time"
                                />
                            </CardContent>
                        </Card>

                        <Card className="print:bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg text-cyan-900">Monthly Comparison</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Bar
                                    data={barChartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: 'bottom' },
                                        },
                                    }}
                                    aria-label="Bar chart showing monthly health log comparison"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="chart-container mt-6">
                        <Card className="max-w-md print:bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg text-cyan-900">
                                    <PieChart className="h-5 w-5 text-cyan-600" />
                                    Nutrition Status Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
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
                                        aria-label="Doughnut chart showing nutrition status distribution"
                                    />
                                ) : (
                                    <p className="py-8 text-center text-cyan-700">No nutrition status data available.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Children Details Table */}
            <div className="mb-8">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-cyan-900">
                    <Baby className="h-5 w-5 text-cyan-600" />
                    Children Details
                </h3>
                <Card className="print:bg-white">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableCaption className="text-cyan-700">
                                    List of children registered in {data.barangay} for the selected period.
                                </TableCaption>
                                <TableHeader>
                                    <TableRow className="bg-cyan-50">
                                        <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Name</TableHead>
                                        <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Birthday</TableHead>
                                        <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Age (months)</TableHead>
                                        <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Sex</TableHead>
                                        <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Weight (kg)</TableHead>
                                        <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Height (cm)</TableHead>
                                        <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Nutr. Status</TableHead>
                                        <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Vit. A</TableHead>
                                        <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Deworming</TableHead>
                                        <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">MNP</TableHead>
                                        <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Last Visit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.healthlogs.map((log, index) => (
                                        <TableRow key={index} className="transition-colors hover:bg-cyan-50/50 print:text-xs">
                                            <TableCell className="px-4 py-2">{log.child_name}</TableCell>
                                            <TableCell className="px-4 py-2">{log.birthdate}</TableCell>
                                            <TableCell className="px-4 py-2">{log.age}</TableCell>
                                            <TableCell className="px-4 py-2">{log.sex}</TableCell>
                                            <TableCell className="px-4 py-2">{log.weight}</TableCell>
                                            <TableCell className="px-4 py-2">{log.height}</TableCell>
                                            <TableCell className="px-4 py-2">
                                                <span
                                                    className={`rounded px-2 py-1 text-xs font-medium ${
                                                        log.nutrition_status === 'Normal'
                                                            ? 'bg-green-100 text-green-800'
                                                            : log.nutrition_status === 'Underweight'
                                                              ? 'bg-yellow-100 text-yellow-800'
                                                              : log.nutrition_status === 'Overweight'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-orange-100 text-orange-800'
                                                    }`}
                                                >
                                                    {log.nutrition_status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-2">{log.vitamin_a}</TableCell>
                                            <TableCell className="px-4 py-2">{log.deworming}</TableCell>
                                            <TableCell className="px-4 py-2">{log.micronutrient_powder}</TableCell>
                                            <TableCell className="px-4 py-2">{log.last_visit}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Footer */}
            <div className="mt-8 border-t border-cyan-200 pt-4 text-center text-sm text-cyan-700">
                <p>Generated on {data.generated_at}</p>
                <p className="mt-1 flex items-center justify-center gap-2">
                    <Baby className="h-4 w-4 text-cyan-600" />
                    Nutribantay - Nutrition Monitoring System
                </p>
            </div>
        </div>
    );
}
