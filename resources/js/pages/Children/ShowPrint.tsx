import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { initializeTheme } from '@/hooks/use-appearance';
import { route } from '@/lib/routes';
import { shortStatus } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { ArcElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { ArrowLeft, Baby, Printer, TrendingUp } from 'lucide-react';
import { useEffect, useLayoutEffect } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

type HealthLog = {
    weight: number | null;
    height: number | null;
    bmi: number | null;
    nutrition_status: string | null;
    vitamin_a: boolean | null;
    deworming: boolean | null;
    micronutrient_powder: string | null;
    ruf: string | null;
    rusf: string | null;
    complementary_food: string | null;
    status_wfa: string | null;
    status_lfa: string | null;
    status_wfl_wfh: string | null;
    created_at: string | null;
};

type Child = {
    id: number;
    slug: string;
    fullname: string;
    sex: string;
    age: number;
    weight: number | null;
    height: number | null;
    nutrition_status: string | null;
    address: string | null;
    contact_number: string | null;
    created_at: string | null;
    birthdate: string | null;
    healthlogs: HealthLog[];
};

type ShowPrintProps = {
    child: Child;
    generated_at: string;
    generated_by: string;
};

const getStatusColor = (status: string | null) => {
    if (status === 'Normal') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (status === 'Underweight') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    if (status === 'Overweight') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
};

export default function ShowPrint({ child, generated_at, generated_by }: ShowPrintProps) {
    useLayoutEffect(() => {
        const html = document.documentElement;
        html.classList.remove('dark');
        html.style.colorScheme = 'light';
        html.setAttribute('data-theme', 'light');
        html.dataset.printMode = 'true';
    }, []);

    useEffect(() => {
        const html = document.documentElement;
        html.classList.remove('dark');
        html.style.colorScheme = 'light';
        html.setAttribute('data-theme', 'light');
        html.dataset.printMode = 'true';

        const handleBeforePrint = () => {
            const html = document.documentElement;
            html.classList.remove('dark');
            html.style.colorScheme = 'light';
            html.setAttribute('data-theme', 'light');
            html.dataset.printMode = 'true';
        };

        const handleAfterPrint = () => {
            delete html.dataset.printMode;
            initializeTheme();
        };

        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('afterprint', handleAfterPrint);

        return () => {
            delete html.dataset.printMode;
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, []);

    const healthlogs = child.healthlogs || [];

    const lineChartData = {
        labels: healthlogs.map((log) =>
            log.created_at ? new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '',
        ),
        datasets: [
            {
                label: 'Weight (kg)',
                data: healthlogs.map((log) => log.weight),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3,
            },
            {
                label: 'Height (cm)',
                data: healthlogs.map((log) => log.height),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                tension: 0.3,
            },
            {
                label: 'BMI',
                data: healthlogs.map((log) => log.bmi),
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.5)',
                tension: 0.3,
            },
        ],
    };

    const nutritionCounts = { normal: 0, underweight: 0, overweight: 0, stunted: 0 };
    healthlogs.forEach((log) => {
        const status = log.nutrition_status || '';
        if (status === 'Normal') nutritionCounts.normal++;
        else if (['Overweight/Obese', 'Overweight', 'Obese'].includes(status)) nutritionCounts.overweight++;
        else if (['Stunted', 'Severely Stunted'].includes(status)) nutritionCounts.stunted++;
        else if (['Underweight', 'Moderate Malnutrition', 'Severe Malnutrition'].includes(status)) nutritionCounts.underweight++;
    });

    const hasNutritionData = nutritionCounts.normal + nutritionCounts.underweight + nutritionCounts.overweight + nutritionCounts.stunted > 0;

    const doughnutData = {
        labels: ['Normal', 'Underweight', 'Overweight', 'Stunted'],
        datasets: [
            {
                data: [nutritionCounts.normal, nutritionCounts.underweight, nutritionCounts.overweight, nutritionCounts.stunted],
                backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(234, 179, 8, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(249, 115, 22, 0.8)'],
                borderColor: ['rgb(34, 197, 94)', 'rgb(234, 179, 8)', 'rgb(239, 68, 68)', 'rgb(249, 115, 22)'],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-cyan-50 p-4 font-sans sm:p-6 lg:p-8 dark:bg-gray-900 print:bg-white print:text-black">
            <Head title={`${child.fullname} - Print`} />

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
                        font-size: 7pt !important;
                        border-collapse: collapse;
                    }
                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }
                    tr { break-inside: avoid; page-break-inside: avoid; }
                    
                    th, td {
                        padding: 2px 3px !important;
                        white-space: nowrap;
                    }
                    
                    th {
                        font-size: 6.5pt !important;
                        font-weight: 600 !important;
                    }
                    
                    td {
                        font-size: 7pt !important;
                    }
                    
                    .compact-badge {
                        padding: 1px 3px !important;
                        font-size: 7.5pt !important;
                    }
                }
            `}</style>

            <div className="no-print mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    onClick={() => window.print()}
                    className="cursor-pointer bg-gradient-to-r from-cyan-600 to-cyan-400 text-white shadow-md dark:from-cyan-500 dark:to-cyan-300 dark:text-gray-900"
                >
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                </Button>
                <Link href={route('children.show', { child: child.slug })}>
                    <Button variant="outline" className="cursor-pointer border-cyan-300 dark:border-cyan-700">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Profile
                    </Button>
                </Link>
            </div>

            <div className="mb-8 text-center">
                <h1 className="mb-4 text-2xl font-bold text-cyan-900 sm:text-3xl dark:text-cyan-100">Nutribantay</h1>
                <h2 className="text-xl font-bold text-cyan-900 sm:text-2xl dark:text-cyan-100">Child Profile</h2>
                <p className="mt-2 text-base text-cyan-700 sm:text-lg dark:text-cyan-300">{child.fullname}</p>
                <p className="mt-1 text-sm text-cyan-700 dark:text-cyan-300">
                    Generated on {generated_at} by {generated_by}
                </p>
            </div>

            <div className="mb-4 text-xs text-cyan-700 dark:text-cyan-300">
                <p className="mb-1 font-semibold">Legend:</p>
                <p>
                    WFA=Weight-for-Age · LFA=Length/Height-for-Age · WFH=Weight-for-Height · Ind=WFA/LFA/WFH combined&nbsp; SU=Sev.Underweight ·
                    UW=Underweight · N=Normal · OW=Overweight · OB=Obese&nbsp; SS=Sev.Stunted · ST=Stunted · T=Tall · SW=Sev.Wasted · WS=Wasted&nbsp;
                    MM=Mod.Malnutrition · SM=Sev.Malnutrition
                </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-md border border-cyan-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800 print:bg-white">
                    <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-cyan-900 sm:text-lg dark:text-cyan-100">
                        <Baby className="h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-400" />
                        Personal Information
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between gap-2">
                            <span className="text-cyan-700 dark:text-cyan-300">Full Name:</span>
                            <span className="font-medium">{child.fullname}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-cyan-700 dark:text-cyan-300">Age:</span>
                            <span className="font-medium">{child.age ?? '-'} months</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-cyan-700 dark:text-cyan-300">Sex:</span>
                            <span className="font-medium">{child.sex}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-cyan-700 dark:text-cyan-300">Birthdate:</span>
                            <span className="font-medium">{child.birthdate ?? '-'}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-cyan-700 dark:text-cyan-300">Address:</span>
                            <span className="font-medium">{child.address ?? '-'}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-cyan-700 dark:text-cyan-300">Contact:</span>
                            <span className="font-medium">{child.contact_number ?? '-'}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-cyan-700 dark:text-cyan-300">Registered:</span>
                            <span className="font-medium">{child.created_at ?? '-'}</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-md border border-cyan-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800 print:bg-white">
                    <h3 className="mb-4 text-base font-bold text-cyan-900 sm:text-lg dark:text-cyan-100">Current Measurements</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between gap-2">
                            <span className="text-cyan-700 dark:text-cyan-300">Weight:</span>
                            <span className="font-medium">{child.weight ?? '-'} kg</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-cyan-700 dark:text-cyan-300">Height:</span>
                            <span className="font-medium">{child.height ?? '-'} cm</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-cyan-700 dark:text-cyan-300">Nutrition Status:</span>
                            <span className="font-medium">{child.nutrition_status ?? '-'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            {healthlogs.length > 0 && (
                <div className="chart-container mb-8">
                    <div className="mb-4 flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 shrink-0 text-cyan-900 dark:text-cyan-100" />
                        <h3 className="text-lg font-bold text-cyan-900 sm:text-xl dark:text-cyan-100">Growth Charts</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-md border border-cyan-200 bg-white p-3 sm:p-4 dark:border-gray-700 dark:bg-gray-800 print:bg-white">
                            <h4 className="mb-4 text-center text-xs font-semibold text-cyan-900 sm:text-sm dark:text-cyan-100">
                                Weight & Height Over Time
                            </h4>
                            <div className="relative" style={{ height: '280px' }}>
                                <Line
                                    data={lineChartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                                labels: { boxWidth: 12, padding: 12 },
                                            },
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: false,
                                                ticks: { font: { size: 11 } },
                                            },
                                            x: {
                                                ticks: { font: { size: 10 } },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </div>

                        <div className="rounded-md border border-cyan-200 bg-white p-3 sm:p-4 dark:border-gray-700 dark:bg-gray-800 print:bg-white">
                            <h4 className="mb-4 text-center text-xs font-semibold text-cyan-900 sm:text-sm dark:text-cyan-100">
                                Nutrition Status Distribution
                            </h4>
                            <div className="relative" style={{ height: '280px' }}>
                                {hasNutritionData ? (
                                    <Doughnut
                                        data={doughnutData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                    labels: { boxWidth: 12, padding: 12 },
                                                },
                                            },
                                        }}
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                                        No nutrition status data available.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {healthlogs.length > 0 && (
                <div className="mb-8">
                    <h3 className="mb-4 text-lg font-bold text-cyan-900 sm:text-xl dark:text-cyan-100">Health Logs</h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-cyan-50 dark:bg-gray-800">
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900 dark:text-cyan-100">Date</TableHead>
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900 dark:text-cyan-100">Wt</TableHead>
                                    <TableHead className="hidden px-4 py-2 text-left font-semibold text-cyan-900 sm:table-cell dark:text-cyan-100">
                                        Ht
                                    </TableHead>
                                    <TableHead className="hidden px-4 py-2 text-left font-semibold text-cyan-900 sm:table-cell dark:text-cyan-100">
                                        Status
                                    </TableHead>
                                    <TableHead className="hidden px-4 py-2 text-left font-semibold text-cyan-900 sm:table-cell dark:text-cyan-100">
                                        Ind
                                    </TableHead>
                                    <TableHead className="hidden px-4 py-2 text-left font-semibold text-cyan-900 sm:table-cell dark:text-cyan-100">
                                        Vit A
                                    </TableHead>
                                    <TableHead className="hidden px-4 py-2 text-left font-semibold text-cyan-900 sm:table-cell dark:text-cyan-100">
                                        Deworm
                                    </TableHead>
                                    <TableHead className="hidden px-4 py-2 text-left font-semibold text-cyan-900 md:table-cell dark:text-cyan-100">
                                        MNP
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {healthlogs.map((log, index) => (
                                    <TableRow key={index} className="hover:bg-cyan-50/50 dark:hover:bg-gray-700/50 print:text-xs">
                                        <TableCell className="px-4 py-2">
                                            <div className="flex flex-col gap-0.5">
                                                <span>{log.created_at ?? '-'}</span>
                                                <span className="text-xs text-cyan-700 sm:hidden dark:text-cyan-300">
                                                    {log.weight ?? '-'}kg · {log.nutrition_status ?? '-'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-2">{log.weight ?? '-'}</TableCell>
                                        <TableCell className="hidden px-4 py-2 sm:table-cell">{log.height ?? '-'}</TableCell>
                                        <TableCell className="px-4 py-2">
                                            <span
                                                className={`rounded px-2 py-1 text-xs font-medium whitespace-nowrap ${getStatusColor(log.nutrition_status)}`}
                                            >
                                                {log.nutrition_status ?? '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="hidden px-4 py-2 sm:table-cell">
                                            {shortStatus(log.status_wfa)}/{shortStatus(log.status_lfa)}/{shortStatus(log.status_wfl_wfh)}
                                        </TableCell>
                                        <TableCell className="hidden px-4 py-2 sm:table-cell">{log.vitamin_a ? 'Yes' : 'No'}</TableCell>
                                        <TableCell className="hidden px-4 py-2 sm:table-cell">{log.deworming ? 'Yes' : 'No'}</TableCell>
                                        <TableCell className="hidden px-4 py-2 md:table-cell">{log.micronutrient_powder ?? '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
            <div className="mt-6 border-t border-cyan-200 pt-3 text-center text-sm text-cyan-700 sm:mt-8 sm:pt-4 dark:border-gray-700 dark:text-cyan-300">
                <p>
                    Generated on {generated_at} by {generated_by}
                </p>
                <p className="mt-1 flex items-center justify-center gap-2">
                    <Baby className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
                    Nutribantay - Nutrition Monitoring System
                </p>
            </div>
        </div>
    );
}
