import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import smartToast from '@/utils/smartToast';
import { MySwal, swalTheme } from '@/utils/sweetAlertConfig';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { ArcElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import {
    AlertTriangle,
    Check,
    ClipboardList,
    Copy,
    Download,
    Edit2,
    Lightbulb,
    MessageSquare,
    OctagonAlert,
    Pill,
    Plus,
    Printer,
    Syringe,
    Trash2,
    TrendingUp,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

type Note = {
    id: number;
    note: string;
    created_at: string;
    author?: { name: string | null };
};

type HealthLog = {
    id: number;
    weight: number | null;
    height: number | null;
    bmi: number | null;
    nutrition_status: string | null;
    status_wfa: string | null;
    status_lfa: string | null;
    status_wfl_wfh: string | null;
    vitamin_a: boolean;
    deworming: boolean;
    micronutrient_powder: string | null;
    ruf: string | null;
    rusf: string | null;
    complementary_food: string | null;
    created_at: string;
    user?: { name: string | null };
};

type Child = {
    id: number;
    slug?: string;
    fullname: string;
    first_name: string;
    middle_initial?: string | null;
    last_name: string;
    sex: string;
    age: number | null;
    is_over_60_months?: boolean;
    birthdate: string | null;
    weight: number | null;
    height: number | null;
    address: string | null;
    contact_number: string | null;
    creator?: { name: string | null };
    updater?: { name: string | null };
    created_at: string;
    updated_at: string;
    notes?: Note[];
    healthlogs?: HealthLog[];
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Children Records', href: route('children.index') }];

export default function Show({ child }: { child: Child }) {
    const [notesOpen, setNotesOpen] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [trendRange, setTrendRange] = useState<'6months' | '1year'>('6months');
    const [logPage, setLogPage] = useState(1);
    const logsPerPage = 10;
    const [recommendation, setRecommendation] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [recommendationGenerated, setRecommendationGenerated] = useState(false);
    const [selectedLog, setSelectedLog] = useState<HealthLog | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showExportDialog, setShowExportDialog] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        first_name: child.first_name || '',
        middle_initial: child.middle_initial || '',
        last_name: child.last_name || '',
        sex: child.sex || 'Male',
        birthdate: child.birthdate || '',
        weight: String(child.weight ?? ''),
        height: String(child.height ?? ''),
        contact_number: child.contact_number ?? '',
    });

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (Number(data.weight) > 200) {
            smartToast.error('Weight cannot exceed 200 kg');
            return;
        }
        if (Number(data.height) > 250) {
            smartToast.error('Height cannot exceed 250 cm');
            return;
        }

        put(route('children.update', { child: child.slug }), {
            preserveScroll: true,
            onSuccess: () => {
                smartToast.success('Child record updated successfully!');
                setShowEditModal(false);
                router.reload({ only: ['child'] });
            },
            onError: () => {
                smartToast.error('Failed to update record. Please try again.');
            },
        });
    };

    const handleEditClose = () => {
        setShowEditModal(false);
    };

    const { auth } = usePage<{ auth?: { roles?: string[]; user?: { roles?: string[] } } }>().props;
    const userRoles: string[] = auth?.roles ?? auth?.user?.roles ?? [];
    const isHealthworker = userRoles.some((r: string) => r.toLowerCase().replace(/[\s_]/g, '') === 'healthworker');
    const isAdmin = userRoles.some((r: string) => r.toLowerCase().replace(/[\s_]/g, '') === 'admin');
    const canManageHealthlogs = isHealthworker;
    const canViewAiRecommender = isHealthworker || isAdmin;
    const isOveraged = child.is_over_60_months ?? false;

    const getStatusBadgeClass = (status: string | null | undefined) => {
        const s = status || '';
        if (s === 'Normal') return 'bg-green-100 text-green-800';
        if (s.includes('Severe')) return 'bg-red-100 text-red-800';
        if (s.includes('Moderate') || s.includes('Underweight') || s.includes('Wasted') || s.includes('Stunted'))
            return 'bg-yellow-100 text-yellow-800';
        if (s.includes('Overweight') || s.includes('Obese')) return 'bg-orange-100 text-orange-800';
        if (s.includes('Tall')) return 'bg-blue-100 text-blue-800';
        return 'bg-gray-100 text-gray-800';
    };

    const submitNote = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('children.notes.store', { child: child.slug }), { note: newNote });
        setNewNote('');
    };

    const deleteNote = (noteId: number) => {
        MySwal.fire({
            ...swalTheme(),
            title: 'Delete Note?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0891B2',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('children.notes.destroy', { child: child.id, note: noteId }));
            }
        });
    };

    const deleteHealthLog = (logId: number) => {
        MySwal.fire({
            ...swalTheme(),
            title: 'Delete Health Log?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0891B2',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('healthlogs.destroy', { healthlog: logId }), {
                    onSuccess: () => {
                        router.reload({ only: ['child'] });
                    },
                });
            }
        });
    };

    const handleRecommendation = async () => {
        setLoading(true);
        setRecommendation(null);

        try {
            const response = await axios.post(route('recommendations.generate'), {
                child_id: child.id,
            });
            setRecommendation(response.data.recommendation);
            setRecommendationGenerated(true);
        } catch (error) {
            console.error(error);
            setRecommendation('Unable to generate recommendation at this time.');
        } finally {
            setLoading(false);
        }
    };

    const healthlogs = child.healthlogs || [];

    const filteredLogs = trendRange === '6months' ? healthlogs.slice(-6) : healthlogs;

    const lineChartData = {
        labels: filteredLogs.map((log) => new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })),
        datasets: [
            {
                label: 'Weight (kg)',
                data: filteredLogs.map((log) => log.weight),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3,
            },
            {
                label: 'Height (cm)',
                data: filteredLogs.map((log) => log.height),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                tension: 0.3,
            },
            {
                label: 'BMI',
                data: filteredLogs.map((log) => log.bmi),
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.5)',
                tension: 0.3,
            },
        ],
    };

    const nutritionCounts = {
        normal: 0,
        underweight: 0,
        overweight: 0,
        stunted: 0,
    };

    filteredLogs.forEach((log) => {
        const status = log.nutrition_status || '';
        if (status === 'Normal') nutritionCounts.normal++;
        else if (['Overweight/Obese', 'Overweight', 'Obese'].includes(status)) nutritionCounts.overweight++;
        else if (['Stunted', 'Severely Stunted'].includes(status)) nutritionCounts.stunted++;
        else if (['Underweight', 'Moderate Malnutrition', 'Severe Malnutrition'].includes(status)) nutritionCounts.underweight++;
    });

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
        <AppLayout breadcrumbs={[...breadcrumbs, { title: child.fullname, href: route('children.show', { child: child.slug }) }]}>
            <Head title={`${child.fullname} - Child Details`} />

            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .fade-in-up {
                    animation: fadeInUp 0.4s ease-out forwards;
                    opacity: 0;
                }

                .stat-card {
                    animation: fadeInUp 0.5s ease-out forwards;
                    opacity: 0;
                }

                .stat-card:nth-child(1) { animation-delay: 0.1s; }
                .stat-card:nth-child(2) { animation-delay: 0.2s; }
                .stat-card:nth-child(3) { animation-delay: 0.3s; }
                .stat-card:nth-child(4) { animation-delay: 0.4s; }

                .action-btn {
                    transition: all 0.2s ease;
                }

                @media (prefers-reduced-motion: reduce) {
                    .fade-in-up {
                        animation: none;
                        opacity: 1;
                    }

                    .stat-card {
                        animation: none;
                        opacity: 1;
                    }

                    .action-btn {
                        transition: none;
                    }
                }

                .action-btn:hover {
                    transform: scale(1.05);
                }
            `}</style>

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.12),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.25),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.25),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="fade-in-up mb-6 text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-100/50 bg-white/90 px-5 py-2 shadow-lg backdrop-blur-sm dark:border-teal-800/50 dark:bg-gray-800/90">
                            <ClipboardList className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                            <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">Child Profile</span>
                        </div>

                        <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl dark:text-gray-50">
                            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent dark:from-teal-300 dark:via-cyan-300 dark:to-teal-300">
                                {child.fullname}
                            </span>
                        </h1>
                        <p className="mx-auto max-w-xl text-gray-600 dark:text-gray-300">
                            View and manage child health records and vaccination status
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="fade-in-up mb-6 flex flex-wrap gap-3" style={{ animationDelay: '0.2s' }}>
                        {isOveraged ? (
                            <span className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                <OctagonAlert className="h-4 w-4" />
                                Read-only — Overaged
                            </span>
                        ) : (
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="action-btn inline-flex cursor-pointer items-center gap-2 rounded-md bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg"
                            >
                                <Edit2 className="h-4 w-4" />
                                Edit Record
                            </button>
                        )}

                        <button
                            onClick={() => setShowExportDialog(true)}
                            className="action-btn inline-flex cursor-pointer items-center gap-2 rounded-md bg-gradient-to-r from-cyan-600 to-cyan-400 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-cyan-700 hover:to-cyan-500 hover:shadow-lg"
                        >
                            <Download className="h-4 w-4" />
                            Export / Print
                        </button>

                        {canManageHealthlogs && !isOveraged && (
                            <Link href={route('children.healthlogs.create', { child: child.slug })}>
                                <button className="action-btn inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-green-600 hover:to-emerald-600 hover:shadow-lg">
                                    <Plus className="h-4 w-4" />
                                    Add Health Log
                                </button>
                            </Link>
                        )}

                        {true && (
                            <>
                                <Link href={route('children.vaccines.index', { child: child.slug })}>
                                    <button
                                        className={`action-btn inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg ${
                                            isOveraged
                                                ? 'cursor-pointer bg-gray-400 opacity-80 hover:bg-gray-500'
                                                : 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600'
                                        }`}
                                        title={isOveraged ? 'Read-only — data cannot be modified' : undefined}
                                    >
                                        <Syringe className="h-4 w-4" />
                                        Vaccine Tracker
                                    </button>
                                </Link>

                                <Link href={route('children.vitamins.index', { child: child.slug })}>
                                    <button
                                        className={`action-btn inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg ${
                                            isOveraged
                                                ? 'cursor-pointer bg-gray-400 opacity-80 hover:bg-gray-500'
                                                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
                                        }`}
                                        title={isOveraged ? 'Read-only — data cannot be modified' : undefined}
                                    >
                                        <Pill className="h-4 w-4" />
                                        Vitamin Tracker
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Child Details Card */}
                    <div className="fade-in-up mb-8" style={{ animationDelay: '0.3s' }}>
                        <div className="overflow-hidden rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 dark:border-gray-700 dark:from-teal-900/20 dark:to-cyan-900/20">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Child Information</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {[
                                        { label: 'Full Name', value: child.fullname },
                                        { label: 'Sex', value: child.sex },
                                        { label: 'Age', value: `${child.age ?? 'N/A'} months` },
                                        { label: 'Weight', value: `${child.weight ?? 'N/A'} kg` },
                                        { label: 'Height', value: `${child.height ?? 'N/A'} cm` },
                                        { label: 'Address', value: child.address ?? 'N/A' },
                                        { label: 'Contact Number', value: child.contact_number ?? 'N/A' },
                                        { label: 'Created by', value: child.creator?.name ?? 'N/A' },
                                        { label: 'Updated by', value: child.updater?.name ?? 'N/A' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="rounded-md bg-gray-50 p-3 dark:bg-gray-700">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{item.label}</p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-700">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Created at</p>
                                        <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {child.created_at
                                                ? `by ${child.creator?.name ?? 'Unknown'} on ${new Date(child.created_at).toLocaleString()}`
                                                : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-700">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Last updated at</p>
                                        <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {child.updated_at
                                                ? `by ${child.updater?.name ?? 'Unknown'} on ${new Date(child.updated_at).toLocaleString()}`
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trend Charts Section */}
                    {healthlogs.length > 0 && (
                        <div className="fade-in-up mb-8" style={{ animationDelay: '0.4s' }}>
                            <div className="mb-4 flex items-center gap-2">
                                <TrendingUp className="h-6 w-6 text-teal-600" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Growth Trends</h2>
                            </div>

                            <div className="mb-4 flex gap-2">
                                <button
                                    onClick={() => setTrendRange('6months')}
                                    className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                                        trendRange === '6months'
                                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                                            : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    Last 6 Months
                                </button>
                                <button
                                    onClick={() => setTrendRange('1year')}
                                    className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                                        trendRange === '1year'
                                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                                            : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    Last Year
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div
                                    className="fade-in-up rounded-xl border-0 bg-white p-4 shadow-md transition-all hover:shadow-lg dark:bg-gray-800"
                                    style={{ animationDelay: '0.5s' }}
                                >
                                    <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Weight, Height & BMI Over Time</h3>
                                    <Line
                                        data={lineChartData}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                },
                                            },
                                            scales: {
                                                y: {
                                                    beginAtZero: false,
                                                },
                                            },
                                        }}
                                    />
                                </div>

                                <div
                                    className="fade-in-up rounded-xl border-0 bg-white p-4 shadow-md transition-all hover:shadow-lg dark:bg-gray-800"
                                    style={{ animationDelay: '0.6s' }}
                                >
                                    <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Nutrition Status Distribution</h3>
                                    {nutritionCounts.normal + nutritionCounts.underweight + nutritionCounts.overweight + nutritionCounts.stunted >
                                    0 ? (
                                        <Doughnut
                                            data={doughnutData}
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom',
                                                    },
                                                },
                                            }}
                                        />
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400">No nutrition status data available.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {healthlogs.length === 0 && (
                        <div className="fade-in-up mt-8 rounded-xl bg-gray-100 p-6 text-center dark:bg-gray-800" style={{ animationDelay: '0.4s' }}>
                            <p className="text-gray-500 dark:text-gray-400">No health logs yet. Add a health log to see growth trends.</p>
                        </div>
                    )}

                    {/* Health Log Records Table */}
                    {healthlogs.length > 0 && (
                        <div className="fade-in-up mb-8" style={{ animationDelay: '0.5s' }}>
                            <div className="mb-4 flex items-center gap-2">
                                <ClipboardList className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Health Log Records</h2>
                            </div>

                            <div className="overflow-x-auto rounded-xl border-0 bg-white shadow-md dark:bg-gray-800">
                                <table className="w-full text-sm">
                                    <thead className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                Weight (kg)
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                Height (cm)
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">BMI</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                Nutrition Status
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                Status WFA
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                Status LFA
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                Status WFL
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">Vit A</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                Deworming
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">MNP</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Created By</th>
                                            {canManageHealthlogs && (
                                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                    Actions
                                                </th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const sortedLogs = [...healthlogs].sort(
                                                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                                            );
                                            const paginatedLogs = sortedLogs.slice((logPage - 1) * logsPerPage, logPage * logsPerPage);

                                            return paginatedLogs.map((log, idx) => (
                                                <tr
                                                    key={log.id}
                                                    className={`border-t transition-colors hover:bg-teal-50/50 dark:border-gray-700 dark:hover:bg-teal-900/20 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-700/50'}`}
                                                >
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => setSelectedLog(log)}
                                                            className="cursor-pointer text-left font-medium text-teal-600 transition-colors hover:text-teal-700 hover:underline dark:text-teal-400 dark:hover:text-teal-300"
                                                        >
                                                            {log.created_at ? new Date(log.created_at).toLocaleDateString() : 'N/A'}
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-900 dark:text-gray-200">{log.weight ?? '-'}</td>
                                                    <td className="px-4 py-3 text-gray-900 dark:text-gray-200">{log.height ?? '-'}</td>
                                                    <td className="px-4 py-3 text-gray-900 dark:text-gray-200">{log.bmi ?? '-'}</td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(log.nutrition_status)}`}
                                                        >
                                                            {log.nutrition_status ?? '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span
                                                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(log.status_wfa)}`}
                                                        >
                                                            {log.status_wfa ?? '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span
                                                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(log.status_lfa)}`}
                                                        >
                                                            {log.status_lfa ?? '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span
                                                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(log.status_wfl_wfh)}`}
                                                        >
                                                            {log.status_wfl_wfh ?? '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {log.vitamin_a ? (
                                                            <Check className="mx-auto h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <X className="mx-auto h-4 w-4 text-red-600" />
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {log.deworming ? (
                                                            <Check className="mx-auto h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <X className="mx-auto h-4 w-4 text-red-600" />
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {log.micronutrient_powder ? (
                                                            <Check className="mx-auto h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <X className="mx-auto h-4 w-4 text-red-600" />
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-900 dark:text-gray-200">{log.user?.name ?? '-'}</td>
                                                    {canManageHealthlogs && !isOveraged && (
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => setSelectedLog(log)}
                                                                    className="cursor-pointer rounded-md p-1.5 text-teal-600 transition-colors hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/30"
                                                                >
                                                                    <Edit2 className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteHealthLog(log.id)}
                                                                    className="cursor-pointer rounded-md p-1.5 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ));
                                        })()}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                {(() => {
                                    const sortedLogs = [...healthlogs].sort(
                                        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                                    );
                                    const totalPages = Math.ceil(sortedLogs.length / logsPerPage);

                                    return totalPages > 1 ? (
                                        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-gray-700">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                Page {logPage} of {totalPages} ({sortedLogs.length} total)
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                                                    disabled={logPage === 1}
                                                    className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                                >
                                                    Previous
                                                </button>
                                                <button
                                                    onClick={() => setLogPage((p) => Math.min(totalPages, p + 1))}
                                                    disabled={logPage === totalPages}
                                                    className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        </div>
                    )}

                    {/* AI Recommender Section */}
                    {canViewAiRecommender && !isOveraged && (
                        <div
                            className="fade-in-up mb-8 rounded-xl border-0 bg-gradient-to-br from-teal-50 to-cyan-50 p-6 shadow-md dark:from-teal-900/20 dark:to-cyan-900/20"
                            style={{ animationDelay: '0.7s' }}
                        >
                            <div className="mb-4 flex items-center gap-2">
                                <Lightbulb className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">AI Nutrition Recommendation</h2>
                            </div>
                            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                                Generate personalized nutrition recommendations based on the child's latest health log.
                            </p>

                            <button
                                onClick={handleRecommendation}
                                disabled={loading || recommendationGenerated}
                                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? 'Analyzing...' : 'Generate Recommendation'}
                            </button>

                            {recommendation && (
                                <div className="mt-4 rounded-md bg-white p-4 shadow-inner dark:bg-gray-800">
                                    <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Recommendation:</h3>
                                    <p className="text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">{recommendation}</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(recommendation);
                                                smartToast.success('Recommendation copied to clipboard');
                                            }}
                                            className="inline-flex items-center gap-2 rounded-md border border-teal-300 bg-white px-4 py-2 text-sm font-medium text-teal-700 transition-all hover:bg-teal-50 dark:border-teal-600 dark:bg-gray-700 dark:text-teal-300 dark:hover:bg-gray-600"
                                        >
                                            <Copy className="h-4 w-4" />
                                            Copy
                                        </button>
                                        {child.contact_number && (
                                            <button
                                                onClick={() =>
                                                    router.visit(route('sms.index'), {
                                                        data: {
                                                            prefilled_child_id: child.id,
                                                            prefilled_message: recommendation,
                                                        },
                                                    })
                                                }
                                                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-600"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                                Send via SMS
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Health Log Detail Modal */}
                    {selectedLog && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedLog(null)}>
                            <div
                                className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Health Log Details</h2>
                                    <button
                                        onClick={() => setSelectedLog(null)}
                                        className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Measurements */}
                                    <div>
                                        <h3 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">Measurements</h3>
                                        <div className="grid grid-cols-2 gap-4 rounded-md bg-gray-50 p-4 sm:grid-cols-3 dark:bg-gray-700">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Weight</p>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {selectedLog.weight ? `${selectedLog.weight} kg` : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Height</p>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {selectedLog.height ? `${selectedLog.height} cm` : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">BMI</p>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{selectedLog.bmi ?? 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nutrition Status */}
                                    <div>
                                        <h3 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">Nutrition Status</h3>
                                        <div className="grid grid-cols-2 gap-4 rounded-md bg-gray-50 p-4 sm:grid-cols-4 dark:bg-gray-700">
                                            {[
                                                {
                                                    label: 'Overall',
                                                    value: selectedLog.nutrition_status,
                                                    class: getStatusBadgeClass(selectedLog.nutrition_status),
                                                },
                                                { label: 'WFA', value: selectedLog.status_wfa, class: getStatusBadgeClass(selectedLog.status_wfa) },
                                                { label: 'LFA', value: selectedLog.status_lfa, class: getStatusBadgeClass(selectedLog.status_lfa) },
                                                {
                                                    label: 'WFL/WFH',
                                                    value: selectedLog.status_wfl_wfh,
                                                    class: getStatusBadgeClass(selectedLog.status_wfl_wfh),
                                                },
                                            ].map((item, idx) => (
                                                <div key={idx}>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                                                    <span
                                                        className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${item.class}`}
                                                    >
                                                        {item.value ?? '-'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Supplements */}
                                    <div>
                                        <h3 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">Supplements & Programs</h3>
                                        <div className="grid grid-cols-2 gap-4 rounded-md bg-gray-50 p-4 dark:bg-gray-700">
                                            {[
                                                { label: 'Vitamin A', value: selectedLog.vitamin_a },
                                                { label: 'Deworming', value: selectedLog.deworming },
                                                { label: 'Micronutrient Powder (MNP)', value: selectedLog.micronutrient_powder },
                                                { label: 'Complementary Food', value: selectedLog.complementary_food },
                                                { label: 'RUTF (Severely Wasted)', value: selectedLog.ruf },
                                                { label: 'RUSF (Moderately Wasted)', value: selectedLog.rusf },
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}:</span>
                                                    {typeof item.value === 'boolean' ? (
                                                        item.value ? (
                                                            <Check className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <X className="h-4 w-4 text-red-600" />
                                                        )
                                                    ) : (
                                                        <span className="text-gray-900 dark:text-gray-200">
                                                            {item.value || <X className="inline h-4 w-4 text-red-600" />}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Metadata */}
                                    <div>
                                        <h3 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">Record Info</h3>
                                        <div className="grid grid-cols-2 gap-4 rounded-md bg-gray-50 p-4 dark:bg-gray-700">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Created By</p>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{selectedLog.user?.name ?? '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Date Logged</p>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {selectedLog.created_at ? new Date(selectedLog.created_at).toLocaleString() : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-2">
                                    {canManageHealthlogs && !isOveraged && (
                                        <Link href={route('healthlogs.edit', { healthlog: selectedLog.id })}>
                                            <button className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:from-green-600 hover:to-emerald-600 hover:shadow-lg">
                                                <Edit2 className="h-4 w-4" />
                                                Edit
                                            </button>
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => setSelectedLog(null)}
                                        className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Floating Notes Button */}
                    <button
                        className="fixed top-24 right-4 z-50 cursor-pointer rounded-md bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-xl sm:top-36"
                        onClick={() => setNotesOpen(!notesOpen)}
                    >
                        Notes ({child.notes?.length || 0})
                    </button>

                    {/* Sliding Notes Panel */}
                    <div
                        className={`fixed top-0 right-0 z-40 h-full w-80 max-w-[calc(100vw-2rem)] bg-white p-4 shadow-lg transition-transform duration-300 sm:w-96 sm:p-6 dark:bg-gray-800 ${
                            notesOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Notes</h2>
                            <button
                                onClick={() => setNotesOpen(false)}
                                className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {!isOveraged && (
                            <form onSubmit={submitNote} className="mb-4">
                                <textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    className="w-full rounded-md border border-gray-200 bg-gray-50 p-3 text-sm transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400"
                                    rows={3}
                                    placeholder="Add a new note..."
                                />
                                <button className="mt-2 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:from-green-600 hover:to-emerald-600 hover:shadow-lg">
                                    <Plus className="h-4 w-4" />
                                    Add Note
                                </button>
                            </form>
                        )}

                        {child.notes?.length ? (
                            child.notes.map((note) => (
                                <div key={note.id} className="mb-3 rounded-md bg-gray-50 p-3 dark:bg-gray-700">
                                    <p className="text-sm text-gray-700 dark:text-gray-200">{note.note}</p>
                                    <small className="mt-1 block text-gray-500 dark:text-gray-400">
                                        {note.created_at
                                            ? `by ${note.author?.name ?? 'Unknown'} on ${new Date(note.created_at).toLocaleString()}`
                                            : 'N/A'}
                                    </small>
                                    {!isOveraged && (
                                        <button
                                            className="mt-2 inline-flex items-center gap-1 text-sm text-red-600 transition-colors hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                            onClick={() => deleteNote(note.id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Delete
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">No notes yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Dialog
                open={showEditModal}
                onOpenChange={(isOpen) => {
                    if (!isOpen) handleEditClose();
                    setShowEditModal(isOpen);
                }}
            >
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-xl border-0 bg-white shadow-2xl dark:bg-gray-800">
                    <DialogHeader className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 dark:border-gray-700 dark:from-teal-900/20 dark:to-cyan-900/20">
                        <DialogTitle className="text-center text-2xl font-bold text-gray-900 dark:text-gray-50">Edit Child Record</DialogTitle>
                        <DialogDescription className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
                            <span className="inline-flex items-center gap-2 rounded-md bg-amber-50 px-3 py-1.5 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                <AlertTriangle className="h-4 w-4" />
                                Only edit if you entered wrong data. Otherwise, create a health log.
                            </span>
                        </DialogDescription>
                    </DialogHeader>

                    {/* Confirmation Alert */}
                    <div className="mx-6 mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                            <div>
                                <h4 className="font-semibold text-amber-800 dark:text-amber-400">Confirmation Required</h4>
                                <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                                    Only edit this record if <span className="font-semibold">you confirmed you entered wrong data</span>. For new
                                    health measurements, please{' '}
                                    <Link
                                        href={route('children.healthlogs.create', { child: child.slug })}
                                        className="font-semibold text-teal-600 hover:underline dark:text-teal-400"
                                    >
                                        create a health log
                                    </Link>{' '}
                                    instead.
                                </p>
                            </div>
                        </div>
                    </div>

                    {Object.keys(errors).length > 0 && (
                        <div className="mx-6 mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                            <div className="flex items-center gap-2">
                                <OctagonAlert className="h-5 w-5 flex-shrink-0" />
                                <div>
                                    {Object.entries(errors).map(([field, msg]) => (
                                        <p key={field} className="text-sm">
                                            {msg}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleEditSubmit} className="space-y-4 px-6 pb-6">
                        {/* Name Fields */}
                        <div className="rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 dark:border-gray-700 dark:from-teal-900/20 dark:to-cyan-900/20">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">Name</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</Label>
                                        <Input
                                            type="text"
                                            placeholder="First name"
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value.replace(/[^a-zA-ZñÑ\s'-.]/g, ''))}
                                            className="mt-1 rounded-md border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">M.I. (Optional)</Label>
                                        <Input
                                            type="text"
                                            placeholder="M.I. (optional)"
                                            maxLength={5}
                                            value={data.middle_initial}
                                            onChange={(e) => setData('middle_initial', e.target.value.replace(/[^a-zA-ZñÑ.]/g, ''))}
                                            className="mt-1 rounded-md border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</Label>
                                        <Input
                                            type="text"
                                            placeholder="Last name"
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value.replace(/[^a-zA-ZñÑ\s'-.]/g, ''))}
                                            className="mt-1 rounded-md border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sex */}
                        <div className="rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 dark:border-gray-700 dark:from-teal-900/20 dark:to-cyan-900/20">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">Sex</h3>
                            </div>
                            <div className="p-6">
                                <Select value={data.sex} onValueChange={(value) => setData('sex', value)}>
                                    <SelectTrigger className="w-full rounded-md border-gray-200 bg-gray-50 text-sm font-medium transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                                        <SelectValue placeholder="Select sex" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male" className="font-medium">
                                            Male
                                        </SelectItem>
                                        <SelectItem value="Female" className="font-medium">
                                            Female
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Birthdate */}
                        <div className="rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 dark:border-gray-700 dark:from-teal-900/20 dark:to-cyan-900/20">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">Birthdate</h3>
                            </div>
                            <div className="p-6">
                                <Input
                                    type="date"
                                    value={data.birthdate}
                                    onChange={(e) => setData('birthdate', e.target.value)}
                                    className="rounded-md border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                />
                            </div>
                        </div>

                        {/* Weight & Height */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
                                <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 dark:border-gray-700 dark:from-teal-900/20 dark:to-cyan-900/20">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">Weight (kg)</h3>
                                </div>
                                <div className="p-6">
                                    <Input
                                        type="number"
                                        step="0.1"
                                        placeholder="Enter weight"
                                        value={data.weight}
                                        onChange={(e) => setData('weight', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
                                        className="rounded-md border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
                                <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 dark:border-gray-700 dark:from-teal-900/20 dark:to-cyan-900/20">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">Height (cm)</h3>
                                </div>
                                <div className="p-6">
                                    <Input
                                        type="number"
                                        step="0.1"
                                        placeholder="Enter height"
                                        value={data.height}
                                        onChange={(e) => setData('height', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
                                        className="rounded-md border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Number */}
                        <div className="rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 dark:border-gray-700 dark:from-teal-900/20 dark:to-cyan-900/20">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">Contact Number</h3>
                            </div>
                            <div className="p-6">
                                <Input
                                    type="text"
                                    placeholder="e.g., 09171234567"
                                    value={data.contact_number}
                                    onChange={(e) => setData('contact_number', e.target.value.replace(/\D/g, ''))}
                                    className="rounded-md border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    maxLength={11}
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-center gap-4 border-t border-gray-100 pt-6 dark:border-gray-700">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="rounded-md bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleEditClose}
                                variant="outline"
                                className="rounded-md px-8 py-2.5 text-sm font-medium text-gray-800 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {showExportDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowExportDialog(false)}>
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Export / Print</h2>
                            <button onClick={() => setShowExportDialog(false)} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="mb-4 text-sm text-cyan-700 dark:text-cyan-400">
                            Export or print <strong>{child.fullname}</strong>'s profile
                        </p>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => {
                                    setShowExportDialog(false);
                                    window.location.href = route('children.show.print', { child: child.slug });
                                }}
                                className="flex-1 cursor-pointer bg-gradient-to-r from-cyan-600 to-cyan-400 text-white hover:from-cyan-700 hover:to-cyan-500"
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print View
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowExportDialog(false);
                                    window.location.href = route('children.export.single', { child: child.slug });
                                }}
                                className="flex-1 cursor-pointer bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
