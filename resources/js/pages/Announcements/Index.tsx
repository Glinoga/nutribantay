import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import { smartToast } from '@/utils/smartToast';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Bell, Calendar, Edit2, Filter, Loader2, Megaphone, Plus, Search, Sparkles, Trash2, TrendingUp, User, X } from 'lucide-react';
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

export default function Index({ announcements, categories }: { announcements: Announcement[]; categories: Category[] }) {
    const { delete: deleteForm, processing } = useForm();
    const { flash } = usePage<{ flash: { success?: string; error?: string; warning?: string } }>().props;
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        if (flash?.success) {
            smartToast.success(flash.success as string);
        } else if (flash?.error) {
            smartToast.error(flash.error as string);
        } else if (flash?.warning) {
            smartToast.info(flash.warning as string);
        }
    }, [flash]);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const filteredAnnouncements = useMemo(() => {
        return announcements.filter((announcement) => {
            const matchesSearch =
                announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                announcement.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (announcement.author?.toLowerCase() || '').includes(searchQuery.toLowerCase());

            const matchesCategory = selectedCategory === 'all' || announcement.category_id.toString() === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [announcements, searchQuery, selectedCategory]);

    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const active = announcements.filter((a) => {
            const announcementDate = new Date(a.date);
            const endDate = a.end_date ? new Date(a.end_date) : null;
            return announcementDate <= today && (!endDate || endDate >= today);
        }).length;

        const upcoming = announcements.filter((a) => {
            const announcementDate = new Date(a.date);
            return announcementDate > today;
        }).length;

        return {
            total: announcements.length,
            active,
            upcoming,
            categories: categories.length,
        };
    }, [announcements, categories]);

    const handleDelete = (announcement: Announcement) => {
        if (!confirm(`Are you sure you want to delete "${announcement.title}"? This action cannot be undone.`)) {
            return;
        }

        setDeletingId(announcement.id);

        deleteForm(`/admin/announcements/${announcement.id}`, {
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

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.8;
                    }
                }

                @keyframes shimmer {
                    0% {
                        background-position: -1000px 0;
                    }
                    100% {
                        background-position: 1000px 0;
                    }
                }

                .announcement-card {
                    animation: slideIn 0.5s ease-out;
                }

                .announcement-card:hover img {
                    transform: scale(1.05);
                }

                .stat-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
                }

                .filter-pill {
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .filter-pill:hover {
                    transform: scale(1.05);
                }

                .filter-pill.active {
                    animation: pulse 2s ease-in-out infinite;
                }

                .announcements-container::-webkit-scrollbar {
                    width: 12px;
                }

                .announcements-container::-webkit-scrollbar-track {
                    background: linear-gradient(to bottom, rgba(191, 219, 254, 0.3), rgba(233, 213, 255, 0.3));
                    border-radius: 10px;
                }

                .announcements-container::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, rgb(59, 130, 246), rgb(168, 85, 247));
                    border-radius: 10px;
                    border: 2px solid rgba(255, 255, 255, 0.5);
                }

                .announcements-container::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, rgb(37, 99, 235), rgb(147, 51, 234));
                }
            `}</style>

            {/* Modern Gradient Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-8 pb-16">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.1),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header Content */}
                    <div className="mb-8 text-center">
                        <div className="mb-4 inline-flex items-center gap-3 rounded-full bg-white/80 px-6 py-3 shadow-lg backdrop-blur-sm">
                            <Megaphone className="h-6 w-6 text-blue-600" />
                            <span className="text-sm font-semibold text-gray-700">Announcement Management</span>
                        </div>

                        <h1 className="mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                            Manage Announcements
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg text-gray-600">
                            Create, edit, and manage announcements to keep your community informed
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="stat-card group cursor-pointer rounded-2xl border border-blue-100 bg-white/80 p-6 shadow-lg backdrop-blur-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total</p>
                                    <p className="mt-2 text-3xl font-bold text-blue-600">{stats.total}</p>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3 transition-transform group-hover:scale-110">
                                    <Megaphone className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card group cursor-pointer rounded-2xl border border-green-100 bg-white/80 p-6 shadow-lg backdrop-blur-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active</p>
                                    <p className="mt-2 text-3xl font-bold text-green-600">{stats.active}</p>
                                </div>
                                <div className="rounded-full bg-green-100 p-3 transition-transform group-hover:scale-110">
                                    <Bell className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card group cursor-pointer rounded-2xl border border-purple-100 bg-white/80 p-6 shadow-lg backdrop-blur-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Upcoming</p>
                                    <p className="mt-2 text-3xl font-bold text-purple-600">{stats.upcoming}</p>
                                </div>
                                <div className="rounded-full bg-purple-100 p-3 transition-transform group-hover:scale-110">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card group cursor-pointer rounded-2xl border border-pink-100 bg-white/80 p-6 shadow-lg backdrop-blur-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Categories</p>
                                    <p className="mt-2 text-3xl font-bold text-pink-600">{stats.categories}</p>
                                </div>
                                <div className="rounded-full bg-pink-100 p-3 transition-transform group-hover:scale-110">
                                    <Filter className="h-6 w-6 text-pink-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Search Bar */}
                        <div className="relative flex-1 lg:max-w-md">
                            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search announcements..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-full border-2 border-gray-200 bg-white/80 py-3 pr-12 pl-12 backdrop-blur-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-gray-100"
                                >
                                    <X className="h-4 w-4 text-gray-400" />
                                </button>
                            )}
                        </div>

                        {/* Create Button */}
                        <Link href={route('announcements.create')}>
                            <Button className="group relative overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                                <span className="relative z-10 flex items-center gap-2 font-semibold">
                                    <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                                    New Announcement
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 transition-opacity group-hover:opacity-100" />
                            </Button>
                        </Link>
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`filter-pill ${selectedCategory === 'all' ? 'active' : ''} rounded-full px-6 py-2.5 font-medium shadow-md transition-all ${
                                selectedCategory === 'all'
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                    : 'bg-white/80 text-gray-700 hover:bg-white'
                            }`}
                        >
                            All Announcements
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id.toString())}
                                className={`filter-pill ${selectedCategory === category.id.toString() ? 'active' : ''} rounded-full px-6 py-2.5 font-medium shadow-md transition-all ${
                                    selectedCategory === category.id.toString()
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                        : 'bg-white/80 text-gray-700 hover:bg-white'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Announcements Grid */}
            <div className="announcements-container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {filteredAnnouncements.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {filteredAnnouncements.map((announcement, index) => (
                            <div
                                key={announcement.id}
                                className="announcement-card group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:shadow-2xl"
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                }}
                            >
                                {/* Color Accent */}
                                <div
                                    className="absolute inset-x-0 top-0 h-1.5"
                                    style={{
                                        backgroundColor: `var(--${announcement.category.color || 'primary'})`,
                                    }}
                                />

                                {/* Image Section */}
                                <div className="relative h-56 overflow-hidden">
                                    {announcement.image ? (
                                        <>
                                            <img
                                                src={`/storage/${announcement.image}`}
                                                alt={announcement.title}
                                                className="h-full w-full object-cover transition-transform duration-500"
                                            />
                                        </>
                                    ) : (
                                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                            <Megaphone className="h-16 w-16 text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {/* Category Badge */}
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

                                    {/* Title */}
                                    <h3 className="mb-3 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                                        {announcement.title}
                                    </h3>

                                    {/* Metadata */}
                                    <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
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

                                    {/* Divider */}
                                    <div className="mb-4 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                                    {/* Summary */}
                                    <p className="mb-6 line-clamp-3 text-gray-700">{announcement.summary}</p>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <Link href={route('announcements.edit', { announcement: announcement.id })} className="flex-1">
                                            <Button
                                                className="group/btn w-full bg-blue-600 text-white transition-all hover:bg-blue-700 hover:shadow-lg"
                                                size="sm"
                                            >
                                                <Edit2 className="mr-2 h-4 w-4 transition-transform group-hover/btn:rotate-12" />
                                                Edit
                                            </Button>
                                        </Link>

                                        <Button
                                            className="group/btn flex-1 bg-red-600 text-white transition-all hover:bg-red-700 hover:shadow-lg"
                                            size="sm"
                                            onClick={() => handleDelete(announcement)}
                                            disabled={processing && deletingId === announcement.id}
                                        >
                                            {processing && deletingId === announcement.id ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="mr-2 h-4 w-4 transition-transform group-hover/btn:scale-110" />
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
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-white/80 p-12 backdrop-blur-sm">
                        <div className="mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 p-8">
                            <Sparkles className="h-16 w-16 text-blue-600" />
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-gray-900">
                            {searchQuery || selectedCategory !== 'all' ? 'No matching announcements' : 'No announcements yet'}
                        </h3>
                        <p className="mb-6 max-w-md text-center text-gray-600">
                            {searchQuery || selectedCategory !== 'all'
                                ? "Try adjusting your search or filter to find what you're looking for."
                                : 'Get started by creating your first announcement to keep your community informed.'}
                        </p>
                        {!searchQuery && selectedCategory === 'all' && (
                            <Link href={route('announcements.create')}>
                                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                                    <Plus className="mr-2 h-5 w-5" />
                                    Create Your First Announcement
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
