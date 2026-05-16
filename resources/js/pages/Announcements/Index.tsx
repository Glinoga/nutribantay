import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination, type PaginationData } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import { smartToast } from '@/utils/smartToast';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    Bell,
    Calendar,
    Edit2,
    Filter,
    List,
    Loader2,
    Megaphone,
    Plus,
    Search,
    Sparkles,
    Trash2,
    TrendingUp,
    User,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Announcements', href: '/admin/announcements' }];

interface Category {
    id: number;
    name: string;
    slug: string;
    color: string;
    description?: string;
}

interface Announcement {
    id: number;
    title: string;
    category_id: number;
    category: Category;
    date: string;
    end_date?: string;
    author?: string;
    summary: string;
    content: string;
    image?: string;
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
};

export default function Index(props: IndexProps) {
    const { flash } = usePage<{ flash: { success?: string; error?: string; warning?: string } }>().props;
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [searchInput, setSearchInput] = useState(props.search || '');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
                router.get(route('announcements.index'), {
                    search: searchInput || undefined,
                    filter: props.filter,
                    page: 1,
                }, { replace: true, preserveState: true });
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
        router.get(route('announcements.index'), {
            filter: newFilter,
            search: props.search || undefined,
            page: 1,
        }, { replace: true, preserveState: true });
    };

    const handlePageChange = (page: number) => {
        router.get(route('announcements.index'), {
            page,
            filter: props.filter,
            search: props.search || undefined,
        }, { replace: true, preserveScroll: true });
    };

    const handleDelete = (announcement: Announcement) => {
        if (!confirm(`Are you sure you want to delete "${announcement.title}"? This action cannot be undone.`)) {
            return;
        }

        setDeletingId(announcement.id);

        router.delete(`/admin/announcements/${announcement.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeletingId(null);
                smartToast.success(`"${announcement.title}" has been deleted successfully!`);
            },
            onError: () => {
                setDeletingId(null);
                smartToast.error('Failed to delete announcement. Please try again.');
            },
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

                .announcement-card:hover img {
                    transform: scale(1.05);
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

            `}</style>

            <div className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50 pt-8 pb-16">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(13,148,136,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.12),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 text-center">
                        <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-teal-100/50 bg-white/90 px-6 py-3 shadow-lg backdrop-blur-sm">
                            <Megaphone className="h-6 w-6 text-teal-600" />
                            <span className="text-sm font-semibold text-teal-700">Announcement Management</span>
                        </div>

                        <h1 className="mb-3 bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                            Manage Announcements
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg text-gray-600">
                            Create, edit, and manage announcements to keep your community informed
                        </p>
                    </div>

                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="stat-card cursor-pointer rounded-xl border border-teal-100/50 bg-white p-4 shadow-md transition-all hover:border-teal-200 hover:shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Total</p>
                                    <p className="mt-1 text-2xl font-bold text-teal-600">{stats.total}</p>
                                </div>
                                <div className="rounded-full bg-teal-50 p-2.5">
                                    <Megaphone className="h-5 w-5 text-teal-500" />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card cursor-pointer rounded-xl border border-green-100/50 bg-white p-4 shadow-md transition-all hover:border-green-200 hover:shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Active</p>
                                    <p className="mt-1 text-2xl font-bold text-green-600">{stats.active}</p>
                                </div>
                                <div className="rounded-full bg-green-50 p-2.5">
                                    <Bell className="h-5 w-5 text-green-500" />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card cursor-pointer rounded-xl border border-purple-100/50 bg-white p-4 shadow-md transition-all hover:border-purple-200 hover:shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Upcoming</p>
                                    <p className="mt-1 text-2xl font-bold text-purple-600">{stats.upcoming}</p>
                                </div>
                                <div className="rounded-full bg-purple-50 p-2.5">
                                    <TrendingUp className="h-5 w-5 text-purple-500" />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card cursor-pointer rounded-xl border border-cyan-100/50 bg-white p-4 shadow-md transition-all hover:border-cyan-200 hover:shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Categories</p>
                                    <p className="mt-1 text-2xl font-bold text-cyan-600">{stats.categories}</p>
                                </div>
                                <div className="rounded-full bg-cyan-50 p-2.5">
                                    <Filter className="h-5 w-5 text-cyan-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative flex-1 lg:max-w-md">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search announcements..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-10 pl-10 text-sm shadow-sm transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                            />
                            {searchInput && (
                                <button
                                    onClick={() => {
                                        setSearchInput('');
                                        router.get(route('announcements.index'), {
                                            filter: props.filter,
                                            page: 1,
                                        }, { replace: true, preserveState: true });
                                    }}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Link href={route('announcements.create')}>
                                <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 text-sm shadow-md hover:from-teal-600 hover:to-cyan-600">
                                    <Plus className="mr-1.5 h-4 w-4" />
                                    New Announcement
                                </Button>
                            </Link>

                            <Link href="/admin/announcements-archived">
                                <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-sm shadow-md hover:from-amber-600 hover:to-yellow-600">
                                    <Trash2 className="mr-1.5 h-4 w-4" />
                                    View Archived
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Show:</span>
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
                                        : 'border border-gray-200 bg-white/90 text-gray-700 hover:bg-white'
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
                                    : 'border border-gray-200 bg-white/90 text-gray-700 hover:bg-white'
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
                                        : 'border border-gray-200 bg-white/90 text-gray-700 hover:bg-white'
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
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredAnnouncements.map((announcement, index) => (
                            <div
                                key={announcement.id}
                                className="announcement-card group flex h-full flex-col relative overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-xl"
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                }}
                            >
                                <div
                                    className="absolute inset-x-0 top-0 h-1.5"
                                    style={{
                                        backgroundColor: `var(--${announcement.category.color || 'primary'})`,
                                    }}
                                />

                                <div className="relative h-48 overflow-hidden">
                                    {announcement.image ? (
                                        <img
                                            src={`/storage/${announcement.image}`}
                                            alt={announcement.title}
                                            className="h-full w-full object-cover transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
                                            <Megaphone className="h-14 w-14 text-teal-300" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col p-5">
                                    <div className="mb-3 flex flex-wrap gap-2">
                                        <Badge
                                            className="font-semibold shadow-sm"
                                            style={{
                                                backgroundColor: `var(--${announcement.category.color || 'primary'})`,
                                                color: 'white',
                                            }}
                                        >
                                            {announcement.category.name}
                                        </Badge>
                                        {announcement.is_expired && (
                                            <Badge className="bg-red-500 font-semibold text-white shadow-sm">
                                                Expired
                                            </Badge>
                                        )}
                                    </div>

                                    <h3 className="mb-3 text-lg font-bold text-gray-900 transition-colors group-hover:text-teal-600">
                                        {announcement.title}
                                    </h3>

                                    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" />
                                            <span>{announcement.date}</span>
                                        </div>
                                        {announcement.author && (
                                            <div className="flex items-center gap-1.5">
                                                <User className="h-4 w-4" />
                                                <span>{announcement.author}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-3 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                                    <p className="mb-5 line-clamp-3 text-sm text-gray-700">{announcement.summary}</p>

                                    <div className="mt-auto flex gap-2">
                                        <Link href={route('announcements.edit', { announcement: announcement.id })} className="flex-1">
                                            <Button
                                                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm shadow-sm hover:from-teal-600 hover:to-cyan-600"
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
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="mr-1.5 h-4 w-4" />
                                                    Delete
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl bg-white p-12 shadow-sm">
                        <div className="mb-6 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 p-8">
                            <Sparkles className="h-16 w-16 text-teal-600" />
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-gray-900">
                            {props.search || selectedCategory !== 'all' ? 'No matching announcements' : 'No announcements yet'}
                        </h3>
                        <p className="mb-6 max-w-md text-center text-gray-600">
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
