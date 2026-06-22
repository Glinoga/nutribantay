import AnnouncementCard from '@/components/announcement-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination, type PaginationData } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import { smartToast } from '@/utils/smartToast';
import { MySwal, swalTheme } from '@/utils/sweetAlertConfig';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    Bell,
    Calendar,
    Edit2,
    Filter,
    LayoutGrid,
    List,
    Loader2,
    Megaphone,
    Plus,
    Search,
    Sparkles,
    Trash2,
    TrendingUp,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Announcements', href: route('announcements.index') }];

interface Category {
    id: number;
    name: string;
    slug: string;
    color: string;
    description?: string;
}

interface Announcement {
    id: number;
    slug?: string;
    title: string;
    category_id: number;
    category: Category;
    date: string;
    end_date?: string;
    author?: string;
    summary: string;
    content: string;
    image?: string;
    image_url?: string | null;
    is_expired?: boolean;
    created_at: string;
    updated_at: string;
}

type IndexProps = {
    announcements: Announcement[];
    pagination: PaginationData;
    categories: Category[];
    filter: string;
    search?: string;
    view?: string;
};

export default function Index(props: IndexProps) {
    const { flash } = usePage<{ flash: { success?: string; error?: string; warning?: string } }>().props;
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [searchInput, setSearchInput] = useState(props.search || '');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const view = (props.view as 'card' | 'list') || 'card';

    useEffect(() => {
        if (flash?.success) {
            smartToast.success(flash.success as string);
        } else if (flash?.error) {
            smartToast.error(flash.error as string);
        } else if (flash?.warning) {
            smartToast.info(flash.warning as string);
        }
    }, [flash]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== (props.search || '')) {
                router.get(
                    route('announcements.index'),
                    {
                        search: searchInput || undefined,
                        filter: props.filter,
                        page: 1,
                    },
                    { replace: true, preserveState: true },
                );
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const active = props.announcements.filter((a) => {
            const announcementDate = new Date(a.date);
            const endDate = a.end_date ? new Date(a.end_date) : null;
            return announcementDate <= today && (!endDate || endDate >= today);
        }).length;

        const upcoming = props.announcements.filter((a) => {
            const announcementDate = new Date(a.date);
            return announcementDate > today;
        }).length;

        return {
            total: props.pagination.total,
            active,
            upcoming,
            categories: props.categories.length,
        };
    }, [props.announcements, props.pagination.total, props.categories.length]);

    const filteredAnnouncements = useMemo(() => {
        if (selectedCategory === 'all') return props.announcements;
        return props.announcements.filter((a) => a.category_id.toString() === selectedCategory);
    }, [props.announcements, selectedCategory]);

    const handleFilterChange = (newFilter: string) => {
        router.get(
            route('announcements.index'),
            {
                filter: newFilter,
                search: props.search || undefined,
                page: 1,
            },
            { replace: true, preserveState: true },
        );
    };

    const handleViewChange = (newView: 'card' | 'list') => {
        if (newView === view) return;
        router.get(
            route('announcements.index'),
            {
                filter: props.filter,
                search: props.search || undefined,
                view: newView,
            },
            { replace: true, preserveScroll: true },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            route('announcements.index'),
            {
                page,
                filter: props.filter,
                search: props.search || undefined,
                view,
            },
            { replace: true, preserveScroll: true },
        );
    };

    const handleDelete = (announcement: Announcement) => {
        MySwal.fire({
            ...swalTheme(),
            title: 'Archive Announcement?',
            html: `
                <div style="font-family: 'Montserrat', sans-serif; padding: 1rem 0;">
                    <div style="font-size: 1.125rem; margin-bottom: 1rem; font-weight: 500;">
                        Are you sure you want to archive this announcement?
                    </div>
                    <strong>${announcement.title}</strong>
                    <p style="color: hsl(0 84% 50%); font-size: 0.875rem; margin: 0; line-height: 1.5;">
                        This will hide the announcement. You can restore it later from the archived section.
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
                setDeletingId(announcement.id);

                router.delete(route('announcements.destroy', { announcement: announcement.slug ?? announcement.id }), {
                    preserveScroll: true,
                    onSuccess: () => {
                        setDeletingId(null);
                        smartToast.success(`"${announcement.title}" has been archived successfully!`);
                    },
                    onError: () => {
                        setDeletingId(null);
                        smartToast.error('Failed to archive announcement. Please try again.');
                    },
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Announcements" />

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

                .announcement-card {
                    animation: slideIn 0.4s ease-out forwards;
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

                .stat-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
                }

                .filter-pill {
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .filter-pill:hover {
                    transform: scale(1.05);
                }

                .announcements-container::-webkit-scrollbar {
                    width: 12px;
                }

                .announcements-container::-webkit-scrollbar-track {
                    background: linear-gradient(to bottom, rgba(204, 251, 241, 0.3), rgba(207, 250, 254, 0.3));
                    border-radius: 10px;
                }

                .announcements-container::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, rgb(20, 184, 166), rgb(6, 182, 212));
                    border-radius: 10px;
                    border: 2px solid rgba(255, 255, 255, 0.5);
                }

                .announcements-container::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, rgb(13, 148, 136), rgb(8, 145, 178));
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

            `}</style>

            <div className="relative bg-gradient-to-br from-teal-50 via-white to-cyan-50 pt-8 pb-16 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(13,148,136,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.12),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Pill Badge */}
                    <div className="mb-6 pt-8 text-center">
                        <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-teal-100/50 bg-white/90 px-6 py-3 shadow-lg backdrop-blur-sm dark:border-teal-800/50 dark:bg-gray-800/90">
                            <Megaphone className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                            <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">Announcement Management</span>
                        </div>
                    </div>

                    {/* Glassmorphic Header Card */}
                    <div className="relative mb-8 text-center">
                        <div className="relative mx-auto max-w-2xl rounded-3xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 opacity-50 blur-lg"></div>
                                    <div className="relative rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 p-4 shadow-lg">
                                        <Megaphone className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl dark:from-teal-300 dark:via-cyan-300 dark:to-teal-300">
                                        Manage Announcements
                                    </h1>
                                    <p className="mt-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                                        <Sparkles className="h-4 w-4" />
                                        Create, edit, and manage announcements to keep your community informed
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="stat-card cursor-pointer rounded-xl border border-teal-100/50 bg-white p-4 shadow-md transition-all hover:border-teal-200 hover:shadow-lg dark:border-teal-800/50 dark:bg-gray-800/80">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total</p>
                                    <p className="mt-1 text-2xl font-bold text-teal-600 dark:text-teal-400">{stats.total}</p>
                                </div>
                                <div className="rounded-full bg-teal-50 p-2.5 dark:bg-teal-900/30">
                                    <Megaphone className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card cursor-pointer rounded-xl border border-green-100/50 bg-white p-4 shadow-md transition-all hover:border-green-200 hover:shadow-lg dark:border-green-800/50 dark:bg-gray-800/80">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Active</p>
                                    <p className="mt-1 text-2xl font-bold text-green-600">{stats.active}</p>
                                </div>
                                <div className="rounded-full bg-green-50 p-2.5 dark:bg-green-900/30">
                                    <Bell className="h-5 w-5 text-green-500" />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card cursor-pointer rounded-xl border border-purple-100/50 bg-white p-4 shadow-md transition-all hover:border-purple-200 hover:shadow-lg dark:border-purple-800/50 dark:bg-gray-800/80">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Upcoming</p>
                                    <p className="mt-1 text-2xl font-bold text-purple-600">{stats.upcoming}</p>
                                </div>
                                <div className="rounded-full bg-purple-50 p-2.5 dark:bg-purple-900/30">
                                    <TrendingUp className="h-5 w-5 text-purple-500" />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card cursor-pointer rounded-xl border border-cyan-100/50 bg-white p-4 shadow-md transition-all hover:border-cyan-200 hover:shadow-lg dark:border-cyan-800/50 dark:bg-gray-800/80">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Categories</p>
                                    <p className="mt-1 text-2xl font-bold text-cyan-600">{stats.categories}</p>
                                </div>
                                <div className="rounded-full bg-cyan-50 p-2.5 dark:bg-cyan-900/30">
                                    <Filter className="h-5 w-5 text-cyan-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative flex-1 lg:max-w-md">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search announcements..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full rounded-md border border-gray-200 bg-white py-2.5 pr-10 pl-10 text-sm shadow-sm transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                            />
                            {searchInput && (
                                <button
                                    onClick={() => {
                                        setSearchInput('');
                                        router.get(
                                            route('announcements.index'),
                                            {
                                                filter: props.filter,
                                                page: 1,
                                            },
                                            { replace: true, preserveState: true },
                                        );
                                    }}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-700">
                                <button
                                    onClick={() => handleViewChange('card')}
                                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all ${
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
                                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all ${
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

                            <Link href={route('announcements.create')}>
                                <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 text-sm shadow-md hover:from-teal-600 hover:to-cyan-600">
                                    <Plus className="mr-1.5 h-4 w-4" />
                                    New Announcement
                                </Button>
                            </Link>

                            <Link href={route('announcements.archived')}>
                                <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-sm shadow-md hover:from-amber-600 hover:to-yellow-600">
                                    <Trash2 className="mr-1.5 h-4 w-4" />
                                    View Archived
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <span className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">Show:</span>
                        {[
                            { key: 'active', label: 'Active', icon: Activity },
                            { key: 'expired', label: 'Expired', icon: Megaphone },
                            { key: 'all', label: 'All', icon: List },
                        ].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => handleFilterChange(key)}
                                className={`filter-pill inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                                    props.filter === key
                                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                                        : 'border border-gray-200 bg-white/90 text-gray-700 hover:bg-white dark:border-gray-600 dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800'
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`filter-pill rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                                selectedCategory === 'all'
                                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                                    : 'border border-gray-200 bg-white/90 text-gray-700 hover:bg-white dark:border-gray-600 dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800'
                            }`}
                        >
                            All Categories
                        </button>
                        {props.categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id.toString())}
                                className={`filter-pill rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                                    selectedCategory === category.id.toString()
                                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                                        : 'border border-gray-200 bg-white/90 text-gray-700 hover:bg-white dark:border-gray-600 dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="announcements-container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {filteredAnnouncements.length > 0 ? (
                    view === 'card' ? (
                        <div key="card" className="animate-fadeIn">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {filteredAnnouncements.map((announcement, index) => (
                                    <AnnouncementCard
                                        key={announcement.id}
                                        announcement={announcement}
                                        variant="admin"
                                        showAuthor
                                        lineClamp={3}
                                        className="announcement-card"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                        renderActions={() => (
                                            <div className="flex gap-2">
                                                <Link
                                                    href={
                                                        route('announcements.edit', { announcement: announcement.slug }) +
                                                        `?page=${props.pagination.current_page}`
                                                    }
                                                    className="flex-1"
                                                >
                                                    <Button
                                                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-sm text-white shadow-sm hover:from-teal-600 hover:to-cyan-600"
                                                        size="sm"
                                                    >
                                                        <Edit2 className="mr-1.5 h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                </Link>

                                                <Button
                                                    className="bg-red-600 text-white shadow-sm hover:bg-red-700"
                                                    size="sm"
                                                    onClick={() => handleDelete(announcement)}
                                                    disabled={deletingId === announcement.id}
                                                >
                                                    {deletingId === announcement.id ? (
                                                        <>
                                                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                                            Archiving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Trash2 className="mr-1.5 h-4 w-4" />
                                                            Archive
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div key="list" className="animate-fadeIn">
                            <div className="overflow-x-auto rounded-xl bg-white shadow-md dark:bg-gray-800">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30">
                                            <TableHead className="font-semibold text-teal-800 dark:text-teal-200">Title</TableHead>
                                            <TableHead className="hidden font-semibold text-teal-800 md:table-cell dark:text-teal-200">
                                                Category
                                            </TableHead>
                                            <TableHead className="hidden font-semibold text-teal-800 lg:table-cell dark:text-teal-200">
                                                Author
                                            </TableHead>
                                            <TableHead className="hidden font-semibold text-teal-800 sm:table-cell dark:text-teal-200">
                                                Date
                                            </TableHead>
                                            <TableHead className="font-semibold text-teal-800 dark:text-teal-200">Status</TableHead>
                                            <TableHead className="text-right font-semibold text-teal-800 dark:text-teal-200">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAnnouncements.map((announcement) => (
                                            <TableRow key={announcement.id} className="hover:bg-teal-50/50 dark:hover:bg-teal-900/20">
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium text-gray-900 dark:text-gray-50">{announcement.title}</span>
                                                        <span className="text-xs text-gray-500 md:hidden dark:text-gray-400">
                                                            {announcement.category.name}
                                                            {announcement.author ? ` · ${announcement.author}` : ''}
                                                            {` · ${announcement.date}`}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <Badge
                                                        className="font-semibold shadow-sm"
                                                        style={{
                                                            backgroundColor: `var(--${announcement.category.color || 'primary'})`,
                                                            color: 'white',
                                                        }}
                                                    >
                                                        {announcement.category.name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden text-gray-600 lg:table-cell dark:text-gray-300">
                                                    {announcement.author ?? '-'}
                                                </TableCell>
                                                <TableCell className="hidden text-gray-600 sm:table-cell dark:text-gray-300">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                                        <span>{announcement.date}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {announcement.is_expired ? (
                                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                            Expired
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                            Active
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={
                                                                route('announcements.edit', { announcement: announcement.slug }) +
                                                                `?page=${props.pagination.current_page}`
                                                            }
                                                        >
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
                                                            onClick={() => handleDelete(announcement)}
                                                            disabled={deletingId === announcement.id}
                                                        >
                                                            {deletingId === announcement.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                            <span className="sr-only">Archive</span>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl bg-white p-12 shadow-sm dark:bg-gray-800">
                        <div className="mb-6 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 p-8 dark:from-teal-900/50 dark:to-cyan-900/50">
                            <Sparkles className="h-16 w-16 text-teal-600 dark:text-teal-400" />
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-50">
                            {props.search || selectedCategory !== 'all' ? 'No matching announcements' : 'No announcements yet'}
                        </h3>
                        <p className="mb-6 max-w-md text-center text-gray-600 dark:text-gray-300">
                            {props.search || selectedCategory !== 'all'
                                ? "Try adjusting your search or filter to find what you're looking for."
                                : 'Get started by creating your first announcement to keep your community informed.'}
                        </p>
                        {!props.search && selectedCategory === 'all' && (
                            <Link href={route('announcements.create')}>
                                <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 text-sm shadow-md hover:from-teal-600 hover:to-cyan-600">
                                    <Plus className="mr-1.5 h-4 w-4" />
                                    Create Your First Announcement
                                </Button>
                            </Link>
                        )}
                    </div>
                )}

                <Pagination pagination={props.pagination} onPageChange={handlePageChange} />
            </div>
        </AppLayout>
    );
}
