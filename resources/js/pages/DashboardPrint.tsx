import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { initializeTheme } from '@/hooks/use-appearance';
import { route } from '@/lib/routes';
import { Head, Link } from '@inertiajs/react';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { ArrowLeft, Baby, BarChart3, PieChart, Printer, TrendingUp } from 'lucide-react';
import { useEffect, useLayoutEffect } from 'react';
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
    useLayoutEffect(() => {
        const html = document.documentElement;
        html.classList.remove('dark');
        html.style.colorScheme = 'light';
        html.setAttribute('data-theme', 'light');
    }, []);

    useEffect(() => {
        const handleBeforePrint = () => {
            const html = document.documentElement;
            html.classList.remove('dark');
            html.style.colorScheme = 'light';
            html.setAttribute('data-theme', 'light');
        };

        const handleAfterPrint = () => {
            initializeTheme();
        };

        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('afterprint', handleAfterPrint);

        return () => {
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, []);

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
        <div className="min-h-screen bg-cyan-50 p-4 font-sans sm:p-6 lg:p-8 dark:bg-gray-900 print:bg-white print:text-black">
            <Head title={`Nutribantay Dashboard Report - ${period}`} />

            <style>{`
                @page {
                    size: A4 landscape;
                    margin: 1.0cm;
                }
                @media print {
                    body { orphans: 3; widows: 3; }
                    .min-h-screen { min-height: 0 !important; }
                    * { print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
                    .no-print { display: none !important; }
                    
                    table { 
                        break-inside: auto; 
                        width: 100%;
                        font-size: 9pt !important;
                        border-collapse: collapse;
                    }
                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }
                    tr { break-inside: avoid; page-break-inside: avoid; }
                    
                    th, td {
                        padding: 4px 6px !important;
                        white-space: nowrap;
                    }
                    
                    th {
                        font-size: 8.5pt !important;
                        font-weight: 600 !important;
                    }
                    
                    td {
                        font-size: 9pt !important;
                    }
                    
                    .compact-badge {
                        padding: 1px 3px !important;
                        font-size: 7.5pt !important;
                    }
                }
            `}</style>

            {/* Print Controls */}
            <div className="no-print mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    onClick={() => window.print()}
                    className="cursor-pointer bg-gradient-to-r from-cyan-600 to-cyan-400 text-white shadow-md transition-all duration-200 hover:from-cyan-700 hover:to-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 dark:from-cyan-500 dark:to-cyan-300 dark:text-gray-900"
                >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Report
                </Button>
                <Link href={route('dashboard')}>
                    <Button
                        variant="outline"
                        className="cursor-pointer border-cyan-300 transition-all duration-200 hover:bg-cyan-50 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 dark:border-cyan-700 dark:hover:bg-cyan-950"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>

            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="mb-4 text-2xl font-bold text-cyan-900 sm:text-3xl dark:text-cyan-100">Nutribantay</h1>
                <h2 className="text-xl font-bold text-cyan-900 sm:text-2xl dark:text-cyan-100">Dashboard Report</h2>
                <p className="mt-2 text-lg text-cyan-600 capitalize dark:text-cyan-400">{period} Report</p>
                <p className="mt-1 text-sm text-cyan-700 dark:text-cyan-300">
                    {data.summary.period_start} to {data.summary.period_end}
                </p>
            </div>

            {/* Summary Section */}
            <div className="mb-8">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-cyan-900 sm:text-xl dark:text-cyan-100">
                    <TrendingUp className="h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-400" />
                    Summary Statistics
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="print:bg-white">
                        <CardHeader>
                            <CardDescription>Total Children</CardDescription>
                            <CardTitle className="text-2xl text-cyan-600 sm:text-3xl dark:text-cyan-400">{data.summary.total_children}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 print:bg-white">
                        <CardHeader>
                            <CardDescription className="text-green-600 dark:text-green-400">Normal</CardDescription>
                            <CardTitle className="text-2xl text-green-600 sm:text-3xl dark:text-green-400">
                                {data.summary.nutrition_status.normal}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 print:bg-white">
                        <CardHeader>
                            <CardDescription className="text-yellow-600 dark:text-yellow-400">Underweight</CardDescription>
                            <CardTitle className="text-2xl text-yellow-600 sm:text-3xl dark:text-yellow-400">
                                {data.summary.nutrition_status.underweight}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 print:bg-white">
                        <CardHeader>
                            <CardDescription className="text-red-600 dark:text-red-400">Overweight</CardDescription>
                            <CardTitle className="text-2xl text-red-600 sm:text-3xl dark:text-red-400">
                                {data.summary.nutrition_status.overweight}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20 print:bg-white">
                        <CardHeader>
                            <CardDescription className="text-orange-600 dark:text-orange-400">Stunted</CardDescription>
                            <CardTitle className="text-2xl text-orange-600 sm:text-3xl dark:text-orange-400">
                                {data.summary.nutrition_status.stunted}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="print:bg-white">
                        <CardHeader>
                            <CardDescription>Vitamin A Given</CardDescription>
                            <CardTitle className="text-2xl text-cyan-900 sm:text-3xl dark:text-cyan-100">
                                {data.summary.vitamin_a_given}
                                <span className="ml-2 text-sm font-normal text-cyan-700 dark:text-cyan-300">
                                    ({data.trends.vitamin_a_percentage}%)
                                </span>
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="print:bg-white">
                        <CardHeader>
                            <CardDescription>Deworming Given</CardDescription>
                            <CardTitle className="text-2xl text-cyan-900 sm:text-3xl dark:text-cyan-100">
                                {data.summary.deworming_given}
                                <span className="ml-2 text-sm font-normal text-cyan-700 dark:text-cyan-300">
                                    ({data.trends.deworming_percentage}%)
                                </span>
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            </div>

            {/* Trend Charts Section */}
            {data.trends.trend.length > 0 && (
                <div className="mb-8">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-cyan-900 sm:text-xl dark:text-cyan-100">
                        <BarChart3 className="h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-400" />
                        Trends
                    </h3>

                    <div className="chart-container grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Card className="print:bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg text-cyan-900 dark:text-cyan-100">Health Logs Over Time</CardTitle>
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
                                <CardTitle className="text-lg text-cyan-900 dark:text-cyan-100">Monthly Comparison</CardTitle>
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
                        <Card className="w-full sm:max-w-md print:bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg text-cyan-900 dark:text-cyan-100">
                                    <PieChart className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
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
                                    <p className="py-8 text-center text-cyan-700 dark:text-cyan-300">No nutrition status data available.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Children Details Table */}
            <div className="mb-8">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-cyan-900 sm:text-xl dark:text-cyan-100">
                    <Baby className="h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-400" />
                    Children Details
                </h3>
                <Card className="print:bg-white">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableCaption className="text-cyan-700 dark:text-cyan-300">
                                    List of children registered for the selected period.
                                </TableCaption>
                                <TableHeader>
                                    <TableRow className="bg-cyan-50 dark:bg-gray-800">
                                        <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900 dark:text-cyan-100">Name</TableHead>
                                        <TableHead className="hidden px-4 py-2 text-left font-semibold text-cyan-900 sm:table-cell dark:text-cyan-100">
                                            Birthday
                                        </TableHead>
                                        <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900 dark:text-cyan-100">
                                            Age (months)
                                        </TableHead>
                                        <TableHead className="hidden px-4 py-2 text-left font-semibold text-cyan-900 sm:table-cell dark:text-cyan-100">
                                            Sex
                                        </TableHead>
                                        <TableHead className="hidden px-4 py-2 text-left font-semibold text-cyan-900 sm:table-cell dark:text-cyan-100">
                                            Weight
                                        </TableHead>
                                        <TableHead className="hidden px-4 py-2 text-left font-semibold text-cyan-900 sm:table-cell dark:text-cyan-100">
                                            Height
                                        </TableHead>
                                        <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900 dark:text-cyan-100">Status</TableHead>
                                        <TableHead className="hidden px-4 py-2 text-left font-semibold text-cyan-900 md:table-cell dark:text-cyan-100">
                                            Vit. A
                                        </TableHead>
                                        <TableHead className="hidden px-4 py-2 text-left font-semibold text-cyan-900 md:table-cell dark:text-cyan-100">
                                            Deworm
                                        </TableHead>
                                        <TableHead className="hidden px-4 py-2 text-left font-semibold text-cyan-900 md:table-cell dark:text-cyan-100">
                                            MNP
                                        </TableHead>
                                        <TableHead className="hidden px-4 py-2 text-left font-semibold text-cyan-900 sm:table-cell dark:text-cyan-100">
                                            Last Visit
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.healthlogs.map((log, index) => (
                                        <TableRow
                                            key={index}
                                            className="transition-colors hover:bg-cyan-50/50 dark:hover:bg-gray-700/50 print:text-xs"
                                        >
                                            <TableCell className="px-4 py-2">
                                                <div className="flex flex-col gap-0.5">
                                                    <span>{log.child_name}</span>
                                                    <span className="text-xs text-cyan-700 sm:hidden dark:text-cyan-300">
                                                        {log.age}mo · {log.nutrition_status}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden px-4 py-2 sm:table-cell">{log.birthdate}</TableCell>
                                            <TableCell className="px-4 py-2">{log.age}</TableCell>
                                            <TableCell className="hidden px-4 py-2 sm:table-cell">{log.sex}</TableCell>
                                            <TableCell className="hidden px-4 py-2 sm:table-cell">{log.weight}</TableCell>
                                            <TableCell className="hidden px-4 py-2 sm:table-cell">{log.height}</TableCell>
                                            <TableCell className="px-4 py-2">
                                                <span
                                                    className={`rounded px-2 py-1 text-xs font-medium whitespace-nowrap ${
                                                        log.nutrition_status === 'Normal'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            : log.nutrition_status === 'Underweight'
                                                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                              : log.nutrition_status === 'Overweight'
                                                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                                    }`}
                                                >
                                                    {log.nutrition_status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden px-4 py-2 md:table-cell">{log.vitamin_a}</TableCell>
                                            <TableCell className="hidden px-4 py-2 md:table-cell">{log.deworming}</TableCell>
                                            <TableCell className="hidden px-4 py-2 md:table-cell">{log.micronutrient_powder}</TableCell>
                                            <TableCell className="hidden px-4 py-2 sm:table-cell">{log.last_visit}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Footer */}
            <div className="mt-6 border-t border-cyan-200 pt-3 text-center text-sm text-cyan-700 sm:mt-8 sm:pt-4 dark:border-gray-700 dark:text-cyan-300">
                <p>Generated on {data.generated_at}</p>
                <p className="mt-1 flex items-center justify-center gap-2">
                    <Baby className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    Nutribantay - Nutrition Monitoring System
                </p>
            </div>
        </div>
    );
}
