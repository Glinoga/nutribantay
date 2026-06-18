import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { Activity, AlertTriangle, Baby, Calendar, Download, Printer, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

type Stats = {
    total_children: number;
    age_breakdown: {
        '0to5': number;
        '6to11': number;
        '12to23': number;
        '24to56': number;
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
    status: 'Overdue' | 'Upcoming' | 'Mixed';
};

type VaccineFollowups = {
    overdue_count: number;
    due_this_month_count: number;
    mixed_count?: number;
    follow_ups: VaccineFollowup[];
};

type VitaminFollowups = {
    overdue_count: number;
    due_this_month_count: number;
    follow_ups: {
        child_id: number;
        child_name: string;
        vitamin_name: string;
        dose_number: number;
        next_due_date: string;
        status: string;
    }[];
};

type DashboardProps = {
    stats: Stats;
    trends: TrendData;
    vaccine_followups: VaccineFollowups;
    vitamin_followups: VitaminFollowups;
    is_admin: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
];

export default function Dashboard({ stats, trends, vaccine_followups, vitamin_followups }: DashboardProps) {
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printPeriod, setPrintPeriod] = useState('monthly');
    const [trendRange, setTrendRange] = useState<'6months' | '1year'>('6months');

    const handlePrint = () => {
        window.open(`${route('dashboard.print')}?period=${printPeriod}`, '_blank');
    };

    const trendData = trendRange === '6months' ? trends.monthly_6months : trends.monthly_1year;

    const lineChartData = {
        labels: trendData.map((t) => t.month),
        datasets: [
            {
                label: 'Health Logs',
                data: trendData.map((t) => t.count),
                borderColor: '#0891B2',
                backgroundColor: 'rgba(8, 145, 178, 0.5)',
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
                backgroundColor: 'rgba(8, 145, 178, 0.7)',
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
                backgroundColor: ['rgba(5, 150, 105, 0.8)', 'rgba(234, 179, 8, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(249, 115, 22, 0.8)'],
                borderColor: ['rgb(5, 150, 105)', 'rgb(234, 179, 8)', 'rgb(239, 68, 68)', 'rgb(249, 115, 22)'],
                borderWidth: 1,
            },
        ],
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-6 font-sans dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                <div className="mx-auto max-w-7xl">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h1 className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">Dashboard</h1>
                            </div>
                            <Dialog open={showPrintModal} onOpenChange={setShowPrintModal}>
                                <DialogTrigger asChild>
                                    <Button className="cursor-pointer bg-gradient-to-r from-cyan-600 to-cyan-400 text-white shadow-md transition-all duration-200 hover:from-cyan-700 hover:to-cyan-500 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export / Print
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Export / Print Report</DialogTitle>
                                    </DialogHeader>
                                    <p className="mb-4 text-cyan-700 dark:text-cyan-300">Select time period for export:</p>

                                    <RadioGroup value={printPeriod} onValueChange={setPrintPeriod} className="mb-6 space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="daily" id="daily" />
                                            <Label htmlFor="daily" className="cursor-pointer">
                                                Daily
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="weekly" id="weekly" />
                                            <Label htmlFor="weekly" className="cursor-pointer">
                                                Weekly
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="monthly" id="monthly" />
                                            <Label htmlFor="monthly" className="cursor-pointer">
                                                Monthly
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="yearly" id="yearly" />
                                            <Label htmlFor="yearly" className="cursor-pointer">
                                                Yearly
                                            </Label>
                                        </div>
                                    </RadioGroup>

                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            onClick={handlePrint}
                                            className="flex-1 cursor-pointer bg-gradient-to-r from-cyan-600 to-cyan-400 text-white transition-all duration-200 hover:from-cyan-700 hover:to-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
                                        >
                                            <Printer className="mr-2 h-4 w-4" />
                                            Print View
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                window.location.href = `${route('dashboard.export')}?period=${printPeriod}`;
                                            }}
                                            className="flex-1 cursor-pointer bg-gradient-to-r from-emerald-600 to-emerald-500 text-white transition-all duration-200 hover:from-emerald-700 hover:to-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export CSV
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                        <Card className="min-h-[44px] cursor-pointer transition-all duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2">
                            <CardHeader className="pb-2">
                                <CardDescription className="flex items-center gap-2">
                                    <Baby className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                    Children Today
                                </CardDescription>
                                <CardTitle className="text-3xl text-cyan-900 dark:text-cyan-100">{stats.daily.children_registered}</CardTitle>
                            </CardHeader>
                        </Card>

                        <Card className="min-h-[44px] cursor-pointer transition-all duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2">
                            <CardHeader className="pb-2">
                                <CardDescription className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                                    Health Logs Today
                                </CardDescription>
                                <CardTitle className="text-3xl text-cyan-900 dark:text-cyan-100">{stats.daily.healthlogs}</CardTitle>
                            </CardHeader>
                        </Card>

                        <Card className="min-h-[44px] cursor-pointer transition-all duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2">
                            <CardHeader className="pb-2">
                                <CardDescription className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                    This Week
                                </CardDescription>
                                <CardTitle className="text-3xl text-cyan-900 dark:text-cyan-100">{stats.weekly.healthlogs}</CardTitle>
                            </CardHeader>
                        </Card>

                        <Card className="min-h-[44px] cursor-pointer transition-all duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2">
                            <CardHeader className="pb-2">
                                <CardDescription className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                                    This Month
                                </CardDescription>
                                <CardTitle className="text-3xl text-cyan-900 dark:text-cyan-100">{stats.monthly.healthlogs}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Total Children Card */}
                    <div className="mb-8">
                        <Card className="border-0 bg-gradient-to-r from-cyan-600 to-cyan-400 text-white shadow-lg">
                            <CardHeader>
                                <CardDescription className="text-cyan-100">Total Children Registered</CardDescription>
                                <CardTitle className="text-5xl font-bold">{stats.total_children}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Vaccine Follow-ups Alert */}
                    {vaccine_followups.overdue_count > 0 || vaccine_followups.due_this_month_count > 0 ? (
                        <div className="mb-8">
                            <Alert
                                className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
                                role="alert"
                                aria-live="assertive"
                            >
                                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                <AlertTitle className="text-amber-900 dark:text-amber-100">Vaccine Follow-ups Needed</AlertTitle>
                                <AlertDescription className="text-amber-700 dark:text-amber-300">
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        {vaccine_followups.overdue_count > 0 && (
                                            <Badge className="cursor-pointer bg-red-100 text-red-800 transition-all duration-200 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50">
                                                {vaccine_followups.overdue_count} overdue
                                            </Badge>
                                        )}
                                        {vaccine_followups.due_this_month_count > 0 && (
                                            <Badge className="cursor-pointer bg-amber-100 text-amber-800 transition-all duration-200 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50">
                                                {vaccine_followups.due_this_month_count} due this month
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Link href={`${route('children.index')}?vaccine_status=overdue`}>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                                aria-label="View overdue vaccine follow-ups"
                                            >
                                                View Overdue
                                            </Button>
                                        </Link>
                                        <Link href={`${route('children.index')}?vaccine_status=upcoming`}>
                                            <Button
                                                size="sm"
                                                className="cursor-pointer bg-amber-600 text-white transition-all duration-200 hover:bg-amber-700 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                                                aria-label="View upcoming vaccine follow-ups"
                                            >
                                                View Upcoming
                                            </Button>
                                        </Link>
                                    </div>

                                    {vaccine_followups.follow_ups.length > 0 && (
                                        <div
                                            className="mt-4 max-h-64 overflow-y-auto rounded-md border border-amber-200 dark:border-amber-800"
                                            role="region"
                                            aria-label="Vaccine follow-ups table"
                                        >
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="sticky top-0 bg-amber-100/50 dark:bg-amber-900/30">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left font-medium text-amber-800 dark:text-amber-300">
                                                                Child
                                                            </th>
                                                            <th className="px-4 py-2 text-left font-medium text-amber-800 dark:text-amber-300">
                                                                Vaccine
                                                            </th>
                                                            <th className="px-4 py-2 text-left font-medium text-amber-800 dark:text-amber-300">
                                                                Dose
                                                            </th>
                                                            <th className="px-4 py-2 text-left font-medium text-amber-800 dark:text-amber-300">
                                                                Due Date
                                                            </th>
                                                            <th className="px-4 py-2 text-left font-medium text-amber-800 dark:text-amber-300">
                                                                Status
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {vaccine_followups.follow_ups.slice(0, 10).map((fu) => (
                                                            <tr
                                                                key={`${fu.child_id}-${fu.vaccine_name}-${fu.dose_number}`}
                                                                className="border-t border-amber-100 transition-colors hover:bg-amber-50/50 dark:border-amber-800 dark:hover:bg-amber-900/20"
                                                            >
                                                                <td className="px-4 py-2">
                                                                    <Link
                                                                        href={route('children.show', { child: fu.child_id })}
                                                                        className="cursor-pointer rounded text-cyan-600 hover:underline focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 dark:text-cyan-400"
                                                                    >
                                                                        {fu.child_name}
                                                                    </Link>
                                                                </td>
                                                                <td className="px-4 py-2 text-cyan-700 dark:text-cyan-300">{fu.vaccine_name}</td>
                                                                <td className="px-4 py-2 text-cyan-700 dark:text-cyan-300">{fu.dose_number}</td>
                                                                <td className="px-4 py-2 text-cyan-700 dark:text-cyan-300">{fu.next_due_date}</td>
                                                                <td className="px-4 py-2">
                                                                    {fu.status === 'Mixed' ? (
                                                                        <div className="flex items-center gap-1">
                                                                            <Badge className="cursor-pointer bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                                                                <AlertTriangle className="mr-1 h-3 w-3" />
                                                                                Overdue
                                                                            </Badge>
                                                                            <Badge className="cursor-pointer bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                                                                <Calendar className="mr-1 h-3 w-3" />
                                                                                Upcoming
                                                                            </Badge>
                                                                        </div>
                                                                    ) : (
                                                                        <Badge
                                                                            className={
                                                                                fu.status === 'Overdue'
                                                                                    ? 'cursor-pointer bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                                                    : 'cursor-pointer bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                                            }
                                                                        >
                                                                            {fu.status}
                                                                        </Badge>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {vaccine_followups.follow_ups.length > 10 && (
                                                <div className="border-t border-amber-200 px-4 py-2 text-center text-sm text-amber-600 dark:border-amber-800 dark:text-amber-400">
                                                    ...and {vaccine_followups.follow_ups.length - 10} more
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </AlertDescription>
                            </Alert>
                        </div>
                    ) : null}

                    {/* Vitamin Follow-ups Alert */}
                    {vitamin_followups.overdue_count > 0 || vitamin_followups.due_this_month_count > 0 ? (
                        <div className="mb-8">
                            <Alert
                                className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20"
                                role="alert"
                                aria-live="assertive"
                            >
                                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                <AlertTitle className="text-orange-900 dark:text-orange-100">Vitamin Follow-ups Needed</AlertTitle>
                                <AlertDescription className="text-orange-700 dark:text-orange-300">
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        {vitamin_followups.overdue_count > 0 && (
                                            <Link href={`${route('children.index')}?vitamin_status=overdue`}>
                                                <Badge className="cursor-pointer bg-red-100 text-red-800 transition-all duration-200 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50">
                                                    {vitamin_followups.overdue_count} overdue
                                                </Badge>
                                            </Link>
                                        )}
                                        {vitamin_followups.due_this_month_count > 0 && (
                                            <Link href={`${route('children.index')}?vitamin_status=upcoming`}>
                                                <Badge className="cursor-pointer bg-amber-100 text-amber-800 transition-all duration-200 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50">
                                                    {vitamin_followups.due_this_month_count} due this month
                                                </Badge>
                                            </Link>
                                        )}
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Link href={`${route('children.index')}?vitamin_status=overdue`}>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                                aria-label="View overdue vitamin follow-ups"
                                            >
                                                View Overdue
                                            </Button>
                                        </Link>
                                        <Link href={`${route('children.index')}?vitamin_status=upcoming`}>
                                            <Button
                                                size="sm"
                                                className="cursor-pointer bg-amber-600 text-white transition-all duration-200 hover:bg-amber-700 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                                                aria-label="View upcoming vitamin follow-ups"
                                            >
                                                View Upcoming
                                            </Button>
                                        </Link>
                                    </div>
                                    {vitamin_followups.follow_ups.length > 0 && (
                                        <div
                                            className="mt-4 max-h-64 overflow-y-auto rounded-md border border-orange-200 dark:border-orange-800"
                                            role="region"
                                            aria-label="Vitamin follow-ups table"
                                        >
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="sticky top-0 bg-orange-100/50 dark:bg-orange-900/30">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left font-medium text-orange-800 dark:text-orange-300">
                                                                Child
                                                            </th>
                                                            <th className="px-4 py-2 text-left font-medium text-orange-800 dark:text-orange-300">
                                                                Vitamin
                                                            </th>
                                                            <th className="px-4 py-2 text-left font-medium text-orange-800 dark:text-orange-300">
                                                                Dose
                                                            </th>
                                                            <th className="px-4 py-2 text-left font-medium text-orange-800 dark:text-orange-300">
                                                                Due Date
                                                            </th>
                                                            <th className="px-4 py-2 text-left font-medium text-orange-800 dark:text-orange-300">
                                                                Status
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {vitamin_followups.follow_ups.slice(0, 10).map((fu) => (
                                                            <tr
                                                                key={`${fu.child_id}-${fu.vitamin_name}-${fu.dose_number}`}
                                                                className="border-t border-orange-100 transition-colors hover:bg-orange-50/50 dark:border-orange-800 dark:hover:bg-orange-900/20"
                                                            >
                                                                <td className="px-4 py-2">
                                                                    <Link
                                                                        href={route('children.show', { child: fu.child_id })}
                                                                        className="cursor-pointer rounded text-teal-600 hover:underline focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:text-teal-400"
                                                                    >
                                                                        {fu.child_name}
                                                                    </Link>
                                                                </td>
                                                                <td className="px-4 py-2 text-orange-700 dark:text-orange-300">{fu.vitamin_name}</td>
                                                                <td className="px-4 py-2 text-orange-700 dark:text-orange-300">{fu.dose_number}</td>
                                                                <td className="px-4 py-2 text-orange-700 dark:text-orange-300">{fu.next_due_date}</td>
                                                                <td className="px-4 py-2">
                                                                    <Badge
                                                                        className={
                                                                            fu.status === 'Overdue'
                                                                                ? 'cursor-pointer bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                                                : 'cursor-pointer bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                                        }
                                                                    >
                                                                        {fu.status}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {vitamin_followups.follow_ups.length > 10 && (
                                                <div className="border-t border-orange-200 px-4 py-2 text-center text-sm text-orange-600 dark:border-orange-800 dark:text-orange-400">
                                                    ...and {vitamin_followups.follow_ups.length - 10} more
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </AlertDescription>
                            </Alert>
                        </div>
                    ) : null}

                    {/* Age Breakdown */}
                    <div className="mb-8">
                        <h2 className="mb-4 text-xl font-bold text-cyan-900 dark:text-cyan-100">Age Breakdown</h2>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <Card className="min-h-[44px] cursor-pointer transition-all duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2">
                                <CardHeader>
                                    <CardDescription>0-5 months</CardDescription>
                                    <CardTitle className="text-3xl text-cyan-600 dark:text-cyan-400">{stats.age_breakdown['0to5']}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card className="min-h-[44px] cursor-pointer transition-all duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2">
                                <CardHeader>
                                    <CardDescription>6-11 months</CardDescription>
                                    <CardTitle className="text-3xl text-cyan-500 dark:text-cyan-400">{stats.age_breakdown['6to11']}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card className="min-h-[44px] cursor-pointer transition-all duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2">
                                <CardHeader>
                                    <CardDescription>12-23 months</CardDescription>
                                    <CardTitle className="text-3xl text-cyan-600 dark:text-cyan-400">{stats.age_breakdown['12to23']}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card className="min-h-[44px] cursor-pointer border-orange-200 bg-orange-50 transition-all duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:border-orange-800 dark:bg-orange-900/20">
                                <CardHeader>
                                    <CardDescription className="text-orange-600 dark:text-orange-400">24-56 months</CardDescription>
                                    <CardTitle className="text-3xl text-orange-600 dark:text-orange-400">{stats.age_breakdown['24to56']}</CardTitle>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>

                    {/* Nutrition Status */}
                    <div className="mb-8">
                        <h2 className="mb-4 text-xl font-bold text-cyan-900 dark:text-cyan-100">Nutrition Status (Last 12 Months)</h2>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <Card className="min-h-[44px] cursor-pointer border-green-200 bg-green-50 transition-all duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 dark:border-green-800 dark:bg-green-900/20">
                                <CardHeader>
                                    <CardDescription className="text-green-600 dark:text-green-400">Normal</CardDescription>
                                    <CardTitle className="text-3xl text-green-600 dark:text-green-400">{stats.nutrition_status.normal}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card className="min-h-[44px] cursor-pointer border-yellow-200 bg-yellow-50 transition-all duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 dark:border-yellow-800 dark:bg-yellow-900/20">
                                <CardHeader>
                                    <CardDescription className="text-yellow-600 dark:text-yellow-400">Underweight</CardDescription>
                                    <CardTitle className="text-3xl text-yellow-600 dark:text-yellow-400">
                                        {stats.nutrition_status.underweight}
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                            <Card className="min-h-[44px] cursor-pointer border-red-200 bg-red-50 transition-all duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:border-red-800 dark:bg-red-900/20">
                                <CardHeader>
                                    <CardDescription className="text-red-600 dark:text-red-400">Overweight</CardDescription>
                                    <CardTitle className="text-3xl text-red-600 dark:text-red-400">{stats.nutrition_status.overweight}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card className="min-h-[44px] cursor-pointer border-orange-200 bg-orange-50 transition-all duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:border-orange-800 dark:bg-orange-900/20">
                                <CardHeader>
                                    <CardDescription className="text-orange-600 dark:text-orange-400">Stunted</CardDescription>
                                    <CardTitle className="text-3xl text-orange-600 dark:text-orange-400">{stats.nutrition_status.stunted}</CardTitle>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>

                    {/* Coverage Stats */}
                    <div className="mb-8">
                        <h2 className="mb-4 text-xl font-bold text-cyan-900 dark:text-cyan-100">Coverage</h2>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <Card className="min-h-[44px] cursor-pointer transition-all duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2">
                                <CardHeader>
                                    <CardDescription>Vitamin A Given</CardDescription>
                                    <CardTitle className="text-3xl text-cyan-900 dark:text-cyan-100">{stats.vitamin_a.given}</CardTitle>
                                    <CardDescription className="text-sm text-cyan-700 dark:text-cyan-300">
                                        ({stats.vitamin_a.percentage}%)
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                            <Card className="min-h-[44px] cursor-pointer transition-all duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2">
                                <CardHeader>
                                    <CardDescription>Deworming Given</CardDescription>
                                    <CardTitle className="text-3xl text-cyan-900 dark:text-cyan-100">{stats.deworming.given}</CardTitle>
                                    <CardDescription className="text-sm text-cyan-700 dark:text-cyan-300">
                                        ({stats.deworming.percentage}%)
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                            <Card className="min-h-[44px] cursor-pointer transition-all duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2">
                                <CardHeader>
                                    <CardDescription>Total Measured</CardDescription>
                                    <CardTitle className="text-3xl text-cyan-900 dark:text-cyan-100">{stats.vitamin_a.total}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card className="min-h-[44px] cursor-pointer transition-all duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2">
                                <CardHeader>
                                    <CardDescription>Health Logs This Year</CardDescription>
                                    <CardTitle className="text-3xl text-cyan-900 dark:text-cyan-100">{stats.yearly.healthlogs}</CardTitle>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>

                    {/* Trend Charts */}
                    <div className="mb-8">
                        <h2 className="mb-4 text-xl font-bold text-cyan-900 dark:text-cyan-100">Trends</h2>

                        <div className="mb-4 flex flex-wrap gap-2">
                            <Button
                                onClick={() => setTrendRange('6months')}
                                variant={trendRange === '6months' ? 'default' : 'outline'}
                                className={
                                    trendRange === '6months'
                                        ? 'cursor-pointer bg-gradient-to-r from-cyan-600 to-cyan-400 text-white transition-all duration-200 hover:from-cyan-700 hover:to-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2'
                                        : 'cursor-pointer hover:border-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2'
                                }
                            >
                                Last 6 Months
                            </Button>
                            <Button
                                onClick={() => setTrendRange('1year')}
                                variant={trendRange === '1year' ? 'default' : 'outline'}
                                className={
                                    trendRange === '1year'
                                        ? 'cursor-pointer bg-gradient-to-r from-cyan-600 to-cyan-400 text-white transition-all duration-200 hover:from-cyan-700 hover:to-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2'
                                        : 'cursor-pointer hover:border-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2'
                                }
                            >
                                Last Year
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" role="region" aria-label="Health trends charts">
                            <Card className="min-h-[44px] transition-all duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2">
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

                            <Card className="min-h-[44px] transition-all duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2">
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

                        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2" role="region" aria-label="Nutrition status distribution chart">
                            <Card className="min-h-[44px] transition-all duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2">
                                <CardHeader>
                                    <CardTitle className="text-lg text-cyan-900 dark:text-cyan-100">Nutrition Status Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
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
                                            aria-label="Doughnut chart showing nutrition status distribution"
                                        />
                                    ) : (
                                        <p className="py-8 text-center text-cyan-700 dark:text-cyan-300">No nutrition status data available.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
