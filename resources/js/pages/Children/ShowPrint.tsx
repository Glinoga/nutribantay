import { route } from '@/lib/routes';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Head, Link } from '@inertiajs/react';
import { ArcElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { ArrowLeft, Baby, Printer, TrendingUp } from 'lucide-react';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

type HealthLog = {
    weight: number | null;
    height: number | null;
    bmi: number | null;
    nutrition_status: string | null;
    vaccine_name: string | null;
    dose_number: number | null;
    date_given: string | null;
    next_due_date: string | null;
    vaccine_status: string | null;
    created_at: string | null;
};

type Child = {
    id: number;
    fullname: string;
    first_name: string;
    middle_initial: string | null;
    last_name: string;
    sex: string;
    age: number | null;
    birthdate: string | null;
    weight: number | null;
    height: number | null;
    bmi: number | null;
    barangay: string | null;
    address: string | null;
    contact_number: string | null;
    created_at: string | null;
    healthlogs: HealthLog[];
};

type ShowPrintProps = {
    child: Child;
    generated_at: string;
};

const getStatusColor = (status: string | null) => {
    if (status === 'Normal') return 'bg-green-100 text-green-800';
    if (status === 'Underweight') return 'bg-yellow-100 text-yellow-800';
    if (status === 'Overweight') return 'bg-red-100 text-red-800';
    return 'bg-orange-100 text-orange-800';
};

export default function ShowPrint({ child, generated_at }: ShowPrintProps) {
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
        <div className="min-h-screen bg-cyan-50 p-8 font-sans print:bg-white">
            <Head title={`${child.fullname} - Print`} />

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                    table { break-inside: auto; }
                    tr { break-inside: avoid; page-break-inside: avoid; }
                    .chart-container { break-inside: avoid; }
                }
            `}</style>

            <div className="no-print mb-8 flex items-center justify-between">
                <Button onClick={() => window.print()} className="cursor-pointer bg-gradient-to-r from-cyan-600 to-cyan-400 text-white shadow-md">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                </Button>
                <Link href={route('children.show', { child: child.id })}>
                    <Button variant="outline" className="cursor-pointer border-cyan-300">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Profile
                    </Button>
                </Link>
            </div>

            <div className="mb-8 text-center">
                <h1 className="mb-4 text-3xl font-bold text-cyan-900">Nutribantay</h1>
                <h2 className="text-2xl font-bold text-cyan-900">Child Profile</h2>
                <p className="mt-2 text-lg text-cyan-700">{child.fullname}</p>
                <p className="mt-1 text-sm text-cyan-700">Generated on {generated_at}</p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-cyan-200 bg-white p-6 print:bg-white">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-cyan-900">
                        <Baby className="h-5 w-5 text-cyan-600" />
                        Personal Information
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-cyan-700">Full Name:</span>
                            <span className="font-medium">{child.fullname}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-cyan-700">Age:</span>
                            <span className="font-medium">{child.age ?? '-'} months</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-cyan-700">Sex:</span>
                            <span className="font-medium">{child.sex}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-cyan-700">Birthdate:</span>
                            <span className="font-medium">{child.birthdate ?? '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-cyan-700">Barangay:</span>
                            <span className="font-medium">{child.barangay ?? '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-cyan-700">Address:</span>
                            <span className="font-medium">{child.address ?? '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-cyan-700">Contact:</span>
                            <span className="font-medium">{child.contact_number ?? '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-cyan-700">Registered:</span>
                            <span className="font-medium">{child.created_at ?? '-'}</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-cyan-200 bg-white p-6 print:bg-white">
                    <h3 className="mb-4 text-lg font-bold text-cyan-900">Current Measurements</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-cyan-700">Weight:</span>
                            <span className="font-medium">{child.weight ?? '-'} kg</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-cyan-700">Height:</span>
                            <span className="font-medium">{child.height ?? '-'} cm</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-cyan-700">BMI:</span>
                            <span className="font-medium">{child.bmi ?? '-'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            {healthlogs.length > 0 && (
                <div className="chart-container mb-8">
                    <div className="mb-4 flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-cyan-900" />
                        <h3 className="text-xl font-bold text-cyan-900">Growth Charts</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-lg border border-cyan-200 bg-white p-4 print:bg-white">
                            <h4 className="mb-4 text-center text-sm font-semibold text-cyan-900">Weight, Height & BMI Over Time</h4>
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

                        <div className="rounded-lg border border-cyan-200 bg-white p-4 print:bg-white">
                            <h4 className="mb-4 text-center text-sm font-semibold text-cyan-900">Nutrition Status Distribution</h4>
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
                                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
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
                    <h3 className="mb-4 text-xl font-bold text-cyan-900">Health Logs</h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-cyan-50">
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Date</TableHead>
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Weight (kg)</TableHead>
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Height (cm)</TableHead>
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">BMI</TableHead>
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Nutr. Status</TableHead>
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Vaccine</TableHead>
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Dose</TableHead>
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Date Given</TableHead>
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Next Due</TableHead>
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {healthlogs.map((log, index) => (
                                    <TableRow key={index} className="hover:bg-cyan-50/50 print:text-xs">
                                        <TableCell className="px-4 py-2">{log.created_at ?? '-'}</TableCell>
                                        <TableCell className="px-4 py-2">{log.weight ?? '-'}</TableCell>
                                        <TableCell className="px-4 py-2">{log.height ?? '-'}</TableCell>
                                        <TableCell className="px-4 py-2">{log.bmi ?? '-'}</TableCell>
                                        <TableCell className="px-4 py-2">
                                            <span className={`rounded px-2 py-1 text-xs font-medium ${getStatusColor(log.nutrition_status)}`}>
                                                {log.nutrition_status ?? '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-2">{log.vaccine_name ?? '-'}</TableCell>
                                        <TableCell className="px-4 py-2">{log.dose_number ?? '-'}</TableCell>
                                        <TableCell className="px-4 py-2">{log.date_given ?? '-'}</TableCell>
                                        <TableCell className="px-4 py-2">{log.next_due_date ?? '-'}</TableCell>
                                        <TableCell className="px-4 py-2">
                                            <span
                                                className={`rounded px-2 py-1 text-xs font-medium ${
                                                    log.vaccine_status === 'overdue'
                                                        ? 'bg-red-100 text-red-800'
                                                        : log.vaccine_status === 'upcoming'
                                                          ? 'bg-yellow-100 text-yellow-800'
                                                          : 'bg-green-100 text-green-800'
                                                }`}
                                            >
                                                {log.vaccine_status ?? '-'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            <div className="mt-8 border-t border-cyan-200 pt-4 text-center text-sm text-cyan-700">
                <p>Generated on {generated_at}</p>
                <p className="mt-1 flex items-center justify-center gap-2">
                    <Baby className="h-4 w-4 text-cyan-600" />
                    Nutribantay - Nutrition Monitoring System
                </p>
            </div>
        </div>
    );
}
