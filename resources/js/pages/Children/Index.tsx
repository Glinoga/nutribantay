import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import { readExcel } from '@/utils/excel';
import smartToast from '@/utils/smartToast';
import { MySwal, swalTheme } from '@/utils/sweetAlertConfig';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    Baby,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Download,
    Edit2,
    FileSpreadsheet,
    LayoutGrid,
    List,
    OctagonAlert,
    Phone,
    Plus,
    Printer,
    Ruler,
    Scale,
    Search,
    Sparkles,
    Trash2,
    Upload,
    User,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
    birthdate?: string | null;
    weight?: number | null;
    height?: number | null;
    contact_number?: string;
    address?: string | null;
    creator?: { name: string | null };
    vaccine_alert?: 'overdue' | 'upcoming' | 'mixed' | null;
    vitamin_alert?: 'overdue' | 'upcoming' | null;
    latest_weight?: number | null;
    latest_height?: number | null;
    latest_bmi?: number | null;
    latest_nutrition_status?: string | null;
};

type Pagination = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
};

type Stats = {
    total: number;
    male: number;
    female: number;
    avgBMI: string;
    vaccine_overdue: number;
    vaccine_upcoming: number;
    vaccine_mixed: number;
    vitamin_overdue: number;
    vitamin_upcoming: number;
    nutrition_statuses?: Record<string, number>;
};

type IndexProps = {
    children: Child[];
    pagination?: Pagination;
    search?: string;
    sex?: string;
    nutrition_status?: string | null;
    flash?: { success?: string };
    stats: Stats;
    vaccine_status?: 'overdue' | 'upcoming' | 'mixed' | null;
    vitamin_status?: 'overdue' | 'upcoming' | null;
    view?: string;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Children Records', href: route('children.index') }];

type AuthProps = {
    auth?: {
        user?: { id: number; name: string; email: string };
        roles?: string[];
    };
};

export default function Index({
    children,
    pagination,
    search = '',
    sex = '',
    nutrition_status = null,
    flash,
    stats,
    vaccine_status = null,
    vitamin_status = null,
    view = 'card',
}: IndexProps) {
    const { auth } = usePage<AuthProps>().props;
    const [searchQuery, setSearchQuery] = useState(search);

    useEffect(() => {
        setSearchQuery(search);
    }, [search]);

    const activeSex = sex || '';
    const activeNutrition = nutrition_status || '';
    const activeVaccine = vaccine_status || '';
    const activeVitamin = vitamin_status || '';

    const roles = auth?.roles ?? [];
    const isHealthworker = roles.includes('Healthworker');
    const isAdmin = roles.includes('Admin');
    const canManageChildren = isHealthworker || isAdmin;
    const canExportChildren = isHealthworker || isAdmin;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [importData, setImportData] = useState<any[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [archiving, setArchiving] = useState(false);

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedFile(null);
        setPreviewData([]);
        setImportData([]);
    };

    const handleExportPrint = () => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (activeSex) params.set('sex', activeSex);
        if (activeNutrition) params.set('nutrition_status', activeNutrition);
        if (activeVaccine) params.set('vaccine_status', activeVaccine);
        if (activeVitamin) params.set('vitamin_status', activeVitamin);
        window.location.href = `${route('children.print')}?${params.toString()}`;
    };

    const handleExportCSV = () => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (activeSex) params.set('sex', activeSex);
        if (activeNutrition) params.set('nutrition_status', activeNutrition);
        if (activeVaccine) params.set('vaccine_status', activeVaccine);
        if (activeVitamin) params.set('vitamin_status', activeVitamin);
        window.location.href = `${route('children.export')}?${params.toString()}`;
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);

        try {
            const rawData = await readExcel(file);
            if (!rawData || rawData.length === 0) {
                smartToast.error('Excel file is empty or not readable');
                return;
            }

            setPreviewData(rawData.slice(0, 10));
            setImportData(rawData);
        } catch (err) {
            console.error('Error reading file:', err);
            smartToast.error('Failed to read Excel file');
        }
    };

    const handleConfirmImport = () => {
        if (importData.length === 0) return;

        setIsImporting(true);

        router.post(
            route('children.import'),
            { data: importData },
            {
                onSuccess: () => {
                    setIsImporting(false);
                    closeModal();
                    const importCount = importData.length;
                    MySwal.fire({
                        ...swalTheme(),
                        title: 'Import Complete!',
                        html: `
                            <div style="font-family: 'Montserrat', sans-serif; text-align: center; padding: 1rem 0;">
                                <p style="font-size: 1.125rem; color: hsl(142 76% 36%); margin-bottom: 0.5rem;">
                                    ${importCount} child(ren) imported successfully.
                                </p>
                                <p style="font-size: 0.875rem; color: hsl(215 4% 27%);">
                                    The page will reload to show the new records.
                                </p>
                            </div>
                        `,
                        icon: 'success',
                        confirmButtonText: 'OK',
                        confirmButtonColor: 'hsl(142 76% 36%)',
                    }).then(() => {
                        window.location.reload();
                    });
                },
                onError: () => {
                    setIsImporting(false);
                    smartToast.error('Import failed. Please check your file and try again.');
                },
            },
        );
    };

    const openImportModal = () => {
        setSelectedFile(null);
        setPreviewData([]);
        setImportData([]);
        setIsModalOpen(true);
    };

    const handleDelete = (child: Child) => {
        if (archiving) return;
        MySwal.fire({
            ...swalTheme(),
            title: 'Archive Child Record?',
            html: `
                <div style="font-family: 'Montserrat', sans-serif; padding: 1rem 0;">
                    <div style="font-size: 1.125rem; margin-bottom: 1rem; font-weight: 500;">
                        Are you sure you want to archive this child's record?
                    </div>
                    <strong>${child.fullname}</strong>
                    <p style="color: hsl(0 84% 50%); font-size: 0.875rem; margin: 0; line-height: 1.5;">
                        This will hide the record. You can restore it later from the archived section.
                    </p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'hsl(0 84% 60%)',
            cancelButtonColor: 'hsl(142 76% 36%)',
            confirmButtonText: 'Yes, Archive',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                setArchiving(true);
                const deleteUrl = `${route('children.destroy', { child: child.slug })}?page=${pagination?.current_page || 1}`;
                router.delete(deleteUrl, {
                    preserveScroll: true,
                    onSuccess: () => {
                        smartToast.success(`${child.fullname}'s record archived successfully!`);
                    },
                    onError: () => {
                        smartToast.error('Failed to archive record. Please try again.');
                    },
                    onFinish: () => setArchiving(false),
                });
            }
        });
    };

    const calculateBMI = (weight?: number | null, height?: number | null) => {
        if (!weight || !height || height <= 0) return null;
        return (weight / Math.pow(height / 100, 2)).toFixed(1);
    };

    const calculateAgeFromBirthdate = (birthdate?: string | null) => {
        if (!birthdate) return null;
        const today = new Date();
        const birth = new Date(birthdate);
        const diffMs = today.getTime() - birth.getTime();
        const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
        if (diffMonths < 0) return null;
        return diffMonths;
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            triggerSearch();
        }
    };

    const triggerSearch = () => {
        const params: Record<string, string> = { search: searchQuery };
        if (activeSex) params.sex = activeSex;
        if (activeNutrition) params.nutrition_status = activeNutrition;
        if (activeVaccine) params.vaccine_status = activeVaccine;
        if (activeVitamin) params.vitamin_status = activeVitamin;
        if (view) params.view = view;
        router.get(route('children.index'), params, { replace: true });
    };

    const handleSort = (column: string) => {
        // ... existing sort handlers ...
        console.log('Sort by:', column);
    };

    const applyFilters = (sex?: string, vaccine?: string | null) => {
        const params: Record<string, string> = {};
        if (searchQuery) params.search = searchQuery;
        if (sex) params.sex = sex;
        if (activeNutrition) params.nutrition_status = activeNutrition;
        if (vaccine) params.vaccine_status = vaccine;
        if (activeVitamin) params.vitamin_status = activeVitamin;
        router.get(route('children.index'), params, { replace: true });
    };

    const handleSexFilter = (sexValue: string) => {
        const params: Record<string, string> = {};
        if (sexValue !== 'all') params.sex = sexValue;
        if (searchQuery) params.search = searchQuery;
        if (activeNutrition) params.nutrition_status = activeNutrition;
        if (activeVaccine) params.vaccine_status = activeVaccine;
        if (activeVitamin) params.vitamin_status = activeVitamin;
        if (view) params.view = view;
        router.get(route('children.index'), params, { replace: true });
    };

    const handleVaccineFilter = (vaccineValue: string) => {
        const params: Record<string, string> = {};
        if (vaccineValue !== activeVaccine) params.vaccine_status = vaccineValue;
        if (searchQuery) params.search = searchQuery;
        if (activeSex) params.sex = activeSex;
        if (activeNutrition) params.nutrition_status = activeNutrition;
        if (view) params.view = view;
        router.get(route('children.index'), params, { replace: true });
    };

    const handleNutritionFilter = (nutritionValue: string) => {
        const params: Record<string, string> = {};
        if (nutritionValue !== activeNutrition) params.nutrition_status = nutritionValue;
        if (searchQuery) params.search = searchQuery;
        if (activeSex) params.sex = activeSex;
        if (activeVaccine) params.vaccine_status = activeVaccine;
        if (activeVitamin) params.vitamin_status = activeVitamin;
        if (view) params.view = view;
        router.get(route('children.index'), params, { replace: true });
    };

    const handleVitaminFilter = (vitaminValue: string) => {
        const params: Record<string, string> = {};
        if (vitaminValue !== activeVitamin) params.vitamin_status = vitaminValue;
        if (searchQuery) params.search = searchQuery;
        if (activeSex) params.sex = activeSex;
        if (activeNutrition) params.nutrition_status = activeNutrition;
        if (view) params.view = view;
        router.get(route('children.index'), params, { replace: true });
    };

    const handleViewChange = (newView: 'card' | 'list') => {
        if (newView === view) return;
        const params: Record<string, string> = { view: newView };
        if (searchQuery) params.search = searchQuery;
        if (activeSex) params.sex = activeSex;
        if (activeNutrition) params.nutrition_status = activeNutrition;
        if (activeVaccine) params.vaccine_status = activeVaccine;
        if (activeVitamin) params.vitamin_status = activeVitamin;
        router.get(route('children.index'), params, { replace: true, preserveScroll: true });
    };

    const handlePageClick = (page: number) => {
        const params: Record<string, string | number> = { page, search: searchQuery };
        if (activeSex) params.sex = activeSex;
        if (activeNutrition) params.nutrition_status = activeNutrition;
        if (activeVaccine) params.vaccine_status = activeVaccine;
        if (activeVitamin) params.vitamin_status = activeVitamin;
        if (view) params.view = view;
        router.get(route('children.index'), params, { replace: true });
    };

    const getPageNumbers = () => {
        if (!pagination) return [];
        const { current_page, last_page } = pagination;
        const pages: (number | string)[] = [];
        const delta = 2;

        if (last_page <= 7) {
            for (let i = 1; i <= last_page; i++) pages.push(i);
        } else {
            pages.push(1);
            if (current_page > delta + 2) pages.push('...');
            const start = Math.max(2, current_page - delta);
            const end = Math.min(last_page - 1, current_page + delta);
            for (let i = start; i <= end; i++) if (!pages.includes(i)) pages.push(i);
            if (current_page < last_page - delta - 1) pages.push('...');
            if (!pages.includes(last_page)) pages.push(last_page);
        }
        return pages;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Children Records" />

            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

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

                .child-card {
                    animation: slideIn 0.4s ease-out forwards;
                    opacity: 0;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(6px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }

                .stat-card {
                    animation: fadeInUp 0.5s ease-out forwards;
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .stat-card:nth-child(1) { animation-delay: 0.1s; }
                .stat-card:nth-child(2) { animation-delay: 0.2s; }
                .stat-card:nth-child(3) { animation-delay: 0.3s; }
                .stat-card:nth-child(4) { animation-delay: 0.4s; }

                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
                }

                .filter-pill {
                    transition: all 0.2s ease;
                }

                .filter-pill:hover {
                    transform: scale(1.05);
                }

                .page-btn {
                    transition: all 0.15s ease;
                }

                .page-btn:hover:not(:disabled) {
                    transform: scale(1.05);
                }

                .page-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>

            <div className="relative min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.12),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.25),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.25),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Pill Badge */}
                    <div className="mb-6 pt-8 text-center">
                        <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-teal-100/50 bg-white/90 px-6 py-3 shadow-lg backdrop-blur-sm dark:border-teal-800/50 dark:bg-gray-800/90">
                            <Baby className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                            <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">Health Records</span>
                        </div>
                    </div>

                    {/* Glassmorphic Header Card */}
                    <div className="relative mb-8 text-center">
                        <div className="relative mx-auto max-w-2xl rounded-3xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 opacity-50 blur-lg"></div>
                                    <div className="relative rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 p-4 shadow-lg">
                                        <Baby className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl dark:from-teal-300 dark:via-cyan-300 dark:to-teal-300">
                                        Children Registry
                                    </h1>
                                    <p className="mt-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                                        <Sparkles className="h-4 w-4" />
                                        Track and manage children&apos;s health, nutrition, and growth records
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <div className="stat-card cursor-pointer rounded-xl border border-teal-100/50 bg-white p-4 shadow-md transition-all hover:border-teal-200 hover:shadow-lg dark:border-teal-800/50 dark:bg-gray-800/80">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Children</p>
                                    <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{stats.total}</p>
                                </div>
                                <div className="rounded-full bg-teal-50 p-2.5 dark:bg-teal-900/30">
                                    <Users className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card cursor-pointer rounded-xl border border-blue-100/50 bg-white p-4 shadow-md transition-all hover:border-blue-200 hover:shadow-lg dark:border-blue-800/50 dark:bg-gray-800/80">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Male</p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.male}</p>
                                </div>
                                <div className="rounded-full bg-blue-50 p-2.5 dark:bg-blue-900/30">
                                    <User className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card cursor-pointer rounded-xl border border-pink-100/50 bg-white p-4 shadow-md transition-all hover:border-pink-200 hover:shadow-lg dark:border-pink-800/50 dark:bg-gray-800/80">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Female</p>
                                    <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{stats.female}</p>
                                </div>
                                <div className="rounded-full bg-pink-50 p-2.5 dark:bg-pink-900/30">
                                    <User className="h-5 w-5 text-pink-500 dark:text-pink-400" />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card cursor-pointer rounded-xl border border-purple-100/50 bg-white p-4 shadow-md transition-all hover:border-purple-200 hover:shadow-lg dark:border-purple-800/50 dark:bg-gray-800/80">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Avg BMI</p>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.avgBMI}</p>
                                </div>
                                <div className="rounded-full bg-purple-50 p-2.5 dark:bg-purple-900/30">
                                    <Activity className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative max-w-md flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                                className="w-full rounded-md border border-gray-200 bg-white py-2.5 pr-16 pl-10 text-sm shadow-sm transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400"
                            />
                            <button
                                onClick={triggerSearch}
                                className="absolute top-1/2 right-3 -translate-y-1/2 p-1.5 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400"
                            >
                                <Search className="h-4 w-4" />
                            </button>
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        const params: Record<string, string> = { search: '', sex: '', vaccine_status: '' };
                                        if (view) params.view = view;
                                        router.get(route('children.index'), params, { replace: true });
                                    }}
                                    className="absolute top-1/2 right-10 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-700">
                                <button
                                    onClick={() => handleViewChange('card')}
                                    className={`flex cursor-pointer items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all ${
                                        view === 'card'
                                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm'
                                            : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                    title="Card view"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                    <span className="hidden sm:inline">Grid</span>
                                </button>
                                <button
                                    onClick={() => handleViewChange('list')}
                                    className={`flex cursor-pointer items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all ${
                                        view === 'list'
                                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm'
                                            : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                    title="List view"
                                >
                                    <List className="h-4 w-4" />
                                    <span className="hidden sm:inline">List</span>
                                </button>
                            </div>

                            {canExportChildren && (
                                <button
                                    onClick={() => setShowExportDialog(true)}
                                    className="cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    <Download className="mr-1.5 inline h-4 w-4" />
                                    Export / Print
                                </button>
                            )}

                            {canManageChildren && (
                                <button
                                    onClick={openImportModal}
                                    className="cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    <FileSpreadsheet className="mr-1.5 inline h-4 w-4" />
                                    Upload Excel
                                </button>
                            )}

                            {canManageChildren && (
                                <Link href={route('children.archived')}>
                                    <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-sm shadow-md hover:from-amber-600 hover:to-yellow-600 sm:w-auto">
                                        <Trash2 className="mr-1.5 h-4 w-4" />
                                        View Archived
                                    </Button>
                                </Link>
                            )}

                            {canManageChildren && (
                                <Link href={route('children.create')}>
                                    <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-sm shadow-md hover:from-teal-600 hover:to-cyan-600 sm:w-auto">
                                        <Plus className="mr-1.5 h-4 w-4" />
                                        Add Child
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                        <button
                            onClick={() => {
                                const params: Record<string, string> = {};
                                if (searchQuery) params.search = searchQuery;
                                if (view) params.view = view;
                                router.get(route('children.index'), params, { replace: true });
                            }}
                            className={`filter-pill rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                                !activeSex && !activeNutrition && !activeVaccine && !activeVitamin
                                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            All ({stats.total})
                        </button>
                        <button
                            onClick={() => handleSexFilter('Male')}
                            className={`filter-pill rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                                activeSex === 'Male'
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            Male ({stats.male})
                        </button>
                        <button
                            onClick={() => handleSexFilter('Female')}
                            className={`filter-pill rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                                activeSex === 'Female'
                                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            Female ({stats.female})
                        </button>

                        {stats.nutrition_statuses && Object.keys(stats.nutrition_statuses).length > 0 && (
                            <>
                                <div className="mx-2 h-6 w-px bg-gray-300" aria-hidden="true" />
                                {Object.entries(stats.nutrition_statuses).map(([status, count]) =>
                                    count > 0 ? (
                                        <button
                                            key={status}
                                            onClick={() => handleNutritionFilter(status)}
                                            className={`filter-pill rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                                                activeNutrition === status
                                                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md'
                                                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                            aria-pressed={activeNutrition === status}
                                        >
                                            {status} ({count})
                                        </button>
                                    ) : null,
                                )}
                            </>
                        )}

                        <div className="mx-2 h-6 w-px bg-gray-300" aria-hidden="true" />

                        {stats.vaccine_overdue > 0 && (
                            <button
                                onClick={() => handleVaccineFilter('overdue')}
                                className={`filter-pill flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                                    activeVaccine === 'overdue'
                                        ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md'
                                        : 'border border-red-200 bg-white text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                                }`}
                                aria-pressed={activeVaccine === 'overdue'}
                            >
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Overdue Vaccine({stats.vaccine_overdue})
                            </button>
                        )}
                        {stats.vaccine_upcoming > 0 && (
                            <button
                                onClick={() => handleVaccineFilter('upcoming')}
                                className={`filter-pill flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                                    activeVaccine === 'upcoming'
                                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md'
                                        : 'border border-amber-200 bg-white text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30'
                                }`}
                                aria-pressed={activeVaccine === 'upcoming'}
                            >
                                <Calendar className="h-3.5 w-3.5" />
                                Vaccine Due Soon ({stats.vaccine_upcoming})
                            </button>
                        )}

                        {stats.vaccine_mixed > 0 && (
                            <button
                                onClick={() => handleVaccineFilter('mixed')}
                                className={`filter-pill flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                                    activeVaccine === 'mixed'
                                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                                        : 'border border-orange-200 bg-white text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30'
                                }`}
                                aria-pressed={activeVaccine === 'mixed'}
                            >
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Mixed ({stats.vaccine_mixed})
                            </button>
                        )}

                        <div className="mx-2 h-6 w-px bg-gray-300" aria-hidden="true" />

                        {stats.vitamin_overdue > 0 && (
                            <button
                                onClick={() => handleVitaminFilter('overdue')}
                                className={`filter-pill flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                                    activeVitamin === 'overdue'
                                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md'
                                        : 'border border-orange-200 bg-white text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30'
                                }`}
                                aria-pressed={activeVitamin === 'overdue'}
                            >
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Vitamin Overdue ({stats.vitamin_overdue})
                            </button>
                        )}
                        {stats.vitamin_upcoming > 0 && (
                            <button
                                onClick={() => handleVitaminFilter('upcoming')}
                                className={`filter-pill flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                                    activeVitamin === 'upcoming'
                                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md'
                                        : 'border border-amber-200 bg-white text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30'
                                }`}
                                aria-pressed={activeVitamin === 'upcoming'}
                            >
                                <Calendar className="h-3.5 w-3.5" />
                                Vitamin Due Soon ({stats.vitamin_upcoming})
                            </button>
                        )}
                    </div>

                    {flash?.success && (
                        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                            {flash.success}
                        </div>
                    )}

                    {children.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
                                <Baby className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No children found</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
                        </div>
                    ) : view === 'card' ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {children.map((child, index) => {
                                const bmi = child.latest_bmi ?? calculateBMI(child.weight, child.height);

                                return (
                                    <div key={child.id} className="child-card group block" style={{ animationDelay: `${index * 50}ms` }}>
                                        <Card className="h-full overflow-hidden rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-xl dark:bg-gray-800">
                                            <CardContent className="flex h-full flex-col p-0">
                                                <div className="flex-1 p-4">
                                                    <div className="mb-3 flex items-start">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold shadow-sm ${
                                                                    child.sex === 'Male'
                                                                        ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 dark:from-blue-800 dark:to-blue-700 dark:text-blue-200'
                                                                        : 'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-700 dark:from-pink-800 dark:to-pink-700 dark:text-pink-200'
                                                                }`}
                                                            >
                                                                {child.fullname.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0 overflow-hidden">
                                                                <p className="line-clamp-2 text-sm leading-tight font-bold text-gray-900 dark:text-gray-100">
                                                                    {child.fullname}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">ID: {child.id}</p>
                                                                {(child.vaccine_alert || child.vitamin_alert) && (
                                                                    <div className="mt-0.5 flex items-center gap-1">
                                                                        {(child.vaccine_alert === 'overdue' || child.vaccine_alert === 'mixed') && (
                                                                            <span className="inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                                                <AlertTriangle className="h-3 w-3" />
                                                                                Vaccine Overdue
                                                                            </span>
                                                                        )}
                                                                        {(child.vaccine_alert === 'upcoming' || child.vaccine_alert === 'mixed') && (
                                                                            <span className="inline-flex items-center gap-1 rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                                                <Calendar className="h-3 w-3" />
                                                                                Vaccine Due Soon
                                                                            </span>
                                                                        )}
                                                                        {child.vitamin_alert === 'overdue' && (
                                                                            <span className="inline-flex items-center gap-1 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                                                                <AlertTriangle className="h-3 w-3" />
                                                                                Vitamin Overdue
                                                                            </span>
                                                                        )}
                                                                        {child.vitamin_alert === 'upcoming' && (
                                                                            <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                                                <Calendar className="h-3 w-3" />
                                                                                Vitamin Due Soon
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mb-3 grid grid-cols-3 gap-2">
                                                        <div className="rounded-md bg-gray-50 p-2 text-center dark:bg-gray-700">
                                                            <Scale className="mx-auto mb-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                                            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                                                {child.latest_weight ?? child.weight ?? '-'}
                                                            </p>
                                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">kg</p>
                                                        </div>
                                                        <div className="rounded-md bg-gray-50 p-2 text-center dark:bg-gray-700">
                                                            <Ruler className="mx-auto mb-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                                            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                                                {child.latest_height ?? child.height ?? '-'}
                                                            </p>
                                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">cm</p>
                                                        </div>
                                                        <div className="rounded-md bg-gray-50 p-2 text-center dark:bg-gray-700">
                                                            <Activity className="mx-auto mb-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                                            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{bmi ?? '-'}</p>
                                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">BMI</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 text-xs">
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                            <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                                                            <span className="truncate">
                                                                {calculateAgeFromBirthdate(child.birthdate) ?? child.age ?? '-'} months old
                                                            </span>
                                                        </div>
                                                        {child.contact_number && (
                                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                                <Phone className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                                                                <span className="truncate">{child.contact_number}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="border-t border-gray-100 dark:border-gray-700">
                                                    <Link
                                                        href={route('children.show', { child: child.slug })}
                                                        className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-teal-600 transition-colors hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20"
                                                    >
                                                        <Activity className="h-3.5 w-3.5" />
                                                        View Profile
                                                    </Link>
                                                </div>

                                                {canManageChildren && !child.is_over_60_months && (
                                                    <div className="flex border-t border-gray-100 dark:border-gray-700">
                                                        <Link
                                                            href={route('children.edit', { child: child.slug })}
                                                            className="flex flex-1 items-center justify-center gap-1 border-r border-gray-100 py-2.5 text-xs font-medium text-teal-600 transition-colors hover:bg-teal-50 dark:border-gray-700 dark:text-teal-400 dark:hover:bg-teal-900/20"
                                                        >
                                                            <Edit2 className="h-3.5 w-3.5" />
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(child)}
                                                            className="flex flex-1 items-center justify-center gap-1 py-2.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Archive
                                                        </button>
                                                    </div>
                                                )}
                                                {canManageChildren && child.is_over_60_months && (
                                                    <div className="flex border-t border-gray-100 py-2.5 dark:border-gray-700">
                                                        <span className="flex w-full items-center justify-center gap-1 text-xs font-medium text-gray-400 dark:text-gray-500">
                                                            <OctagonAlert className="h-3.5 w-3.5" />
                                                            Read-only
                                                        </span>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div key="list" className="animate-fadeIn">
                            <div className="overflow-x-auto rounded-xl bg-white shadow-md dark:bg-gray-800">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30">
                                            <TableHead className="font-semibold text-teal-800 dark:text-teal-200">Name</TableHead>
                                            <TableHead className="hidden font-semibold text-teal-800 sm:table-cell dark:text-teal-200">
                                                Gender
                                            </TableHead>
                                            <TableHead className="hidden font-semibold text-teal-800 md:table-cell dark:text-teal-200">Age</TableHead>
                                            <TableHead className="hidden font-semibold text-teal-800 lg:table-cell dark:text-teal-200">
                                                Latest Wt
                                            </TableHead>
                                            <TableHead className="hidden font-semibold text-teal-800 lg:table-cell dark:text-teal-200">
                                                Latest Ht
                                            </TableHead>
                                            <TableHead className="hidden font-semibold text-teal-800 lg:table-cell dark:text-teal-200">
                                                Latest BMI
                                            </TableHead>
                                            <TableHead className="hidden font-semibold text-teal-800 lg:table-cell dark:text-teal-200">
                                                Nutrition
                                            </TableHead>
                                            <TableHead className="hidden font-semibold text-teal-800 xl:table-cell dark:text-teal-200">
                                                Contact
                                            </TableHead>
                                            <TableHead className="font-semibold text-teal-800 dark:text-teal-200">Alerts</TableHead>
                                            <TableHead className="text-right font-semibold text-teal-800 dark:text-teal-200">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {children.map((child) => {
                                            return (
                                                <TableRow key={child.id} className="hover:bg-teal-50/50 dark:hover:bg-teal-900/20">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
                                                                    child.sex === 'Male'
                                                                        ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 dark:from-blue-800 dark:to-blue-700 dark:text-blue-200'
                                                                        : 'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-700 dark:from-pink-800 dark:to-pink-700 dark:text-pink-200'
                                                                }`}
                                                            >
                                                                {child.fullname.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-gray-900 dark:text-gray-50">{child.fullname}</span>
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">ID: {child.id}</span>
                                                                <span className="text-xs text-gray-500 sm:hidden dark:text-gray-400">
                                                                    {child.sex}
                                                                    {child.age ? ` · ${child.age}mo` : ''}
                                                                    {child.contact_number ? ` · ${child.contact_number}` : ''}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden text-gray-600 sm:table-cell dark:text-gray-300">
                                                        {child.sex}
                                                    </TableCell>
                                                    <TableCell className="hidden text-gray-600 md:table-cell dark:text-gray-300">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                                            <span>{calculateAgeFromBirthdate(child.birthdate) ?? child.age ?? '-'} mo</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden text-gray-600 lg:table-cell dark:text-gray-300">
                                                        {child.latest_weight != null ? `${child.latest_weight} kg` : '-'}
                                                    </TableCell>
                                                    <TableCell className="hidden text-gray-600 lg:table-cell dark:text-gray-300">
                                                        {child.latest_height != null ? `${child.latest_height} cm` : '-'}
                                                    </TableCell>
                                                    <TableCell className="hidden text-gray-600 lg:table-cell dark:text-gray-300">
                                                        {child.latest_bmi ?? '-'}
                                                    </TableCell>
                                                    <TableCell className="hidden text-gray-600 lg:table-cell dark:text-gray-300">
                                                        {child.latest_nutrition_status ? (
                                                            <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400">
                                                                {child.latest_nutrition_status}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="hidden text-gray-600 xl:table-cell dark:text-gray-300">
                                                        <div className="flex items-center gap-1.5">
                                                            <Phone className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                                            <span>{child.contact_number ?? '-'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {(child.vaccine_alert === 'overdue' || child.vaccine_alert === 'mixed') && (
                                                                <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400">
                                                                    <AlertTriangle className="mr-0.5 h-3 w-3" />
                                                                    Overdue Vacc
                                                                </Badge>
                                                            )}
                                                            {(child.vaccine_alert === 'upcoming' || child.vaccine_alert === 'mixed') && (
                                                                <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                                    <Calendar className="mr-0.5 h-3 w-3" />
                                                                    Vacc Due
                                                                </Badge>
                                                            )}
                                                            {child.vitamin_alert === 'overdue' && (
                                                                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400">
                                                                    <AlertTriangle className="mr-0.5 h-3 w-3" />
                                                                    Overdue Vit
                                                                </Badge>
                                                            )}
                                                            {child.vitamin_alert === 'upcoming' && (
                                                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400">
                                                                    <Calendar className="mr-0.5 h-3 w-3" />
                                                                    Vit Due
                                                                </Badge>
                                                            )}
                                                            {!child.vaccine_alert && !child.vitamin_alert && (
                                                                <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Link href={route('children.show', { child: child.slug })}>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 text-teal-600 hover:bg-teal-50 hover:text-teal-700 dark:text-teal-400 dark:hover:bg-teal-900/30 dark:hover:text-teal-300"
                                                                >
                                                                    <Activity className="h-4 w-4" />
                                                                    <span className="sr-only">View</span>
                                                                </Button>
                                                            </Link>
                                                            {canManageChildren && !child.is_over_60_months && (
                                                                <>
                                                                    <Link href={route('children.edit', { child: child.slug })}>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0 text-teal-600 hover:bg-teal-50 hover:text-teal-700 dark:text-teal-400 dark:hover:bg-teal-900/30 dark:hover:text-teal-300"
                                                                        >
                                                                            <Edit2 className="h-4 w-4" />
                                                                            <span className="sr-only">Edit</span>
                                                                        </Button>
                                                                    </Link>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                                                        onClick={() => handleDelete(child)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                        <span className="sr-only">Archive</span>
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {canManageChildren && child.is_over_60_months && (
                                                                <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                                                    <OctagonAlert className="h-3 w-3" />
                                                                    Read-only
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-4 pb-8">
                    <button
                        onClick={() => handlePageClick(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                        className="page-btn flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Prev</span>
                    </button>

                    <div className="hidden items-center gap-1 sm:flex">
                        {getPageNumbers().map((page, idx) =>
                            typeof page === 'number' ? (
                                <button
                                    key={idx}
                                    onClick={() => handlePageClick(page)}
                                    className={`page-btn rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                        page === pagination.current_page
                                            ? 'bg-teal-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {page}
                                </button>
                            ) : (
                                <span key={idx} className="px-2 py-1.5 text-sm text-gray-400 dark:text-gray-500">
                                    ...
                                </span>
                            ),
                        )}
                    </div>

                    <span className="text-sm font-medium text-gray-600 sm:hidden dark:text-gray-400">
                        Page {pagination.current_page} of {pagination.last_page}
                    </span>

                    <button
                        onClick={() => handlePageClick(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page}
                        className="page-btn flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            {showExportDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-gray-800">
                        <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Export / Print</h2>
                                <p className="text-sm text-cyan-700 dark:text-cyan-400">
                                    {searchQuery || activeSex || activeVaccine
                                        ? `Filters: ${[searchQuery, activeSex, activeVaccine, activeVitamin].filter(Boolean).join(', ')}`
                                        : 'All children'}
                                </p>
                            </div>
                            <button onClick={() => setShowExportDialog(false)} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">Choose an option:</p>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    onClick={() => {
                                        setShowExportDialog(false);
                                        handleExportPrint();
                                    }}
                                    className="flex-1 cursor-pointer bg-gradient-to-r from-cyan-600 to-cyan-400 text-white hover:from-cyan-700 hover:to-cyan-500"
                                >
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print View
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowExportDialog(false);
                                        handleExportCSV();
                                    }}
                                    className="flex-1 cursor-pointer bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export CSV
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl dark:bg-gray-800">
                        <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Import Children from Excel</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Upload an Excel file (.xlsx or .xls) with child records</p>
                            </div>
                            <button onClick={closeModal} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-4">
                            {!selectedFile ? (
                                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-12 dark:border-gray-600">
                                    <Upload className="mb-4 h-10 w-10 text-gray-400 dark:text-gray-500" />
                                    <p className="mb-4 text-gray-600 dark:text-gray-300">Click to select an Excel file</p>
                                    <label className="cursor-pointer rounded-md bg-teal-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-600">
                                        Select File
                                        <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileSelect} />
                                    </label>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-4 flex items-center justify-between rounded-md bg-gray-50 p-3 dark:bg-gray-700">
                                        <div className="flex items-center gap-3">
                                            <FileSpreadsheet className="h-6 w-6 text-green-600 dark:text-green-400" />
                                            <div>
                                                <p className="text-sm font-medium dark:text-gray-200">{selectedFile.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className="rounded p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {previewData.length > 0 && (
                                        <div className="mb-4">
                                            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Preview ({importData.length} total rows):
                                            </p>
                                            <div className="max-h-48 overflow-auto rounded-md border border-gray-200 dark:border-gray-600">
                                                <table className="min-w-full text-xs">
                                                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
                                                        <tr>
                                                            <th className="border border-gray-200 px-3 py-2 text-left font-medium dark:border-gray-600 dark:text-gray-200">
                                                                Name
                                                            </th>
                                                            <th className="border border-gray-200 px-3 py-2 text-left font-medium dark:border-gray-600 dark:text-gray-200">
                                                                Mother
                                                            </th>
                                                            <th className="border border-gray-200 px-3 py-2 text-left font-medium dark:border-gray-600 dark:text-gray-200">
                                                                IP
                                                            </th>
                                                            <th className="border border-gray-200 px-3 py-2 text-left font-medium dark:border-gray-600 dark:text-gray-200">
                                                                Gender
                                                            </th>
                                                            <th className="border border-gray-200 px-3 py-2 text-left font-medium dark:border-gray-600 dark:text-gray-200">
                                                                DOB
                                                            </th>
                                                            <th className="border border-gray-200 px-3 py-2 text-left font-medium dark:border-gray-600 dark:text-gray-200">
                                                                Date Measured
                                                            </th>
                                                            <th className="border border-gray-200 px-3 py-2 text-left font-medium dark:border-gray-600 dark:text-gray-200">
                                                                Weight
                                                            </th>
                                                            <th className="border border-gray-200 px-3 py-2 text-left font-medium dark:border-gray-600 dark:text-gray-200">
                                                                Height
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {previewData.map((row, i) => (
                                                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                <td className="border border-gray-200 px-3 py-2 dark:border-gray-600 dark:text-gray-200">
                                                                    {row.first_name} {row.last_name}
                                                                </td>
                                                                <td className="border border-gray-200 px-3 py-2 dark:border-gray-600 dark:text-gray-200">
                                                                    {row.mother_name || '-'}
                                                                </td>
                                                                <td className="border border-gray-200 px-3 py-2 dark:border-gray-600 dark:text-gray-200">
                                                                    {row.belongs_to_ip ? 'YES' : 'NO'}
                                                                </td>
                                                                <td className="border border-gray-200 px-3 py-2 dark:border-gray-600 dark:text-gray-200">
                                                                    {row.sex || '-'}
                                                                </td>
                                                                <td className="border border-gray-200 px-3 py-2 dark:border-gray-600 dark:text-gray-200">
                                                                    {row.birthdate || '-'}
                                                                </td>
                                                                <td className="border border-gray-200 px-3 py-2 dark:border-gray-600 dark:text-gray-200">
                                                                    {row.date_measured || '-'}
                                                                </td>
                                                                <td className="border border-gray-200 px-3 py-2 dark:border-gray-600 dark:text-gray-200">
                                                                    {row.weight || '-'}
                                                                </td>
                                                                <td className="border border-gray-200 px-3 py-2 dark:border-gray-600 dark:text-gray-200">
                                                                    {row.height || '-'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                        >
                                            Different File
                                        </button>
                                        <button
                                            onClick={handleConfirmImport}
                                            disabled={isImporting || importData.length === 0}
                                            className="rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isImporting ? 'Importing...' : `Import ${importData.length} Records`}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
