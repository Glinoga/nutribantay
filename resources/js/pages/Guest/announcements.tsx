import { Pagination, type PaginationData } from '@/components/ui/pagination';
import GuestLayout from '@/layouts/guest-layout';
import { route } from '@/lib/routes';
import { Head, Link, router } from '@inertiajs/react';
import { Check, Megaphone, Search, Share2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

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
    date: string;
    end_date?: string;
    category_id: number;
    category: Category;
    author?: string;
    summary: string;
    content: string;
    image?: string;
    image_url?: string | null;
    is_expired?: boolean;
}

interface AnnouncementsProps {
    announcements: Announcement[];
    pagination: PaginationData;
    categories: Category[];
}

function getCategoryColor(color: string) {
    const colorMap: Record<string, string> = {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        success: 'var(--success)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
        info: 'var(--info)',
    };
    return colorMap[color] || 'var(--primary)';
}

function getCategoryColorClass(categoryColor: string) {
    const colorMap: Record<string, string> = {
        primary: 'bg-[var(--primary)]',
        secondary: 'bg-[var(--secondary)]',
        success: 'bg-[var(--success)]',
        info: 'bg-[var(--info)]',
        warning: 'bg-[var(--warning)]',
        danger: 'bg-[var(--danger)]',
    };
    return colorMap[categoryColor] || 'bg-[var(--primary)]';
}

export default function Announcements({ announcements, pagination, categories }: AnnouncementsProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [sharedId, setSharedId] = useState<number | null>(null);
    const [erroredImages, setErroredImages] = useState<Set<number>>(new Set());

    const handleImageError = (id: number) => {
        setErroredImages((prev) => new Set([...prev, id]));
    };

    const shareAnnouncement = (announcement: Announcement) => {
        const url = `${window.location.origin}/guest/announcements/${announcement.slug}`;
        if (navigator.share) {
            navigator.share({
                title: announcement.title,
                text: announcement.summary,
                url,
            });
        } else {
            navigator.clipboard.writeText(url);
            setSharedId(announcement.id);
            setTimeout(() => setSharedId(null), 2000);
        }
    };

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        announcements.forEach((a) => {
            const name = a.category?.name;
            if (name) counts[name] = (counts[name] || 0) + 1;
        });
        return counts;
    }, [announcements]);

    const filteredAnnouncements = useMemo(() => {
        return announcements.filter((announcement) => {
            const matchesSearch =
                searchQuery === '' ||
                announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                announcement.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                announcement.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (announcement.category?.name?.toLowerCase() ?? '').includes(searchQuery.toLowerCase());

            const matchesCategory = activeFilter === null || (announcement.category && announcement.category.name === activeFilter);

            return matchesSearch && matchesCategory;
        });
    }, [announcements, searchQuery, activeFilter]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleFilterClick = (category: string | null) => {
        setActiveFilter(category === activeFilter ? null : category);
    };

    const handleSearchReset = () => {
        setSearchQuery('');
    };

    const handlePageChange = (page: number) => {
        router.get(route('guest.announcements'), { page }, { replace: true, preserveScroll: true });
    };

    return (
        <GuestLayout title="Announcements">
            <Head title="Announcements" />

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
                .card-clickable {
                    cursor: pointer;
                    transition: all 0.25s ease;
                }
                .card-clickable:hover {
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
                }
                .card-clickable:hover h3 {
                    color: #0891b2;
                }
                @media (prefers-reduced-motion: reduce) {
                    .animate-fade-in-up {
                        animation: none;
                        opacity: 1;
                    }
                    .card-clickable:hover {
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
                    }
                }
            `}</style>

            <section className="animate-fade-in-up relative overflow-hidden bg-gradient-to-br from-[var(--bg-light)] via-white to-[var(--bg)] pt-24 pb-20 md:pt-28 md:pb-20 dark:via-[var(--bg)]">
                <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[var(--primary)] opacity-[0.04]" />

                <div className="container mx-auto px-6 text-center lg:px-8">
                    <span className="mb-2 inline-block rounded-full bg-white/80 px-4 py-1 text-sm font-medium text-[var(--primary)] shadow-sm dark:bg-[var(--bg-light)]/80">
                        COMMUNITY UPDATES
                    </span>
                    <h1 className="mb-6 text-4xl leading-tight font-bold text-[var(--text)] md:text-5xl lg:text-6xl">
                        Latest Announcements
                    </h1>
                    <p className="mx-auto mb-10 max-w-2xl text-lg text-[var(--text-muted)] md:text-xl">
                        Stay informed about upcoming events, programs, and initiatives in our community
                    </p>

                    <div className="relative z-10 mx-auto mt-8 flex max-w-md items-center rounded-md border border-gray-200 bg-white p-1 shadow-sm dark:border-[var(--border)] dark:bg-[var(--bg)]">
                        <Search className="ml-3 h-5 w-5 text-[var(--text-muted)]" />
                        <input
                            id="announcement-search"
                            type="text"
                            placeholder="Search announcements..."
                            className="w-full rounded-md bg-transparent px-4 py-3 text-[var(--text)] focus:ring-2 focus:ring-teal-500/50 dark:focus:ring-[var(--primary)]/50 focus:outline-none"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        {searchQuery && (
                            <button
                                onClick={handleSearchReset}
                                className="mr-3 cursor-pointer rounded-md border border-gray-200 p-1.5 text-[var(--text-muted)] transition-colors hover:bg-gray-100 hover:text-[var(--text)] dark:border-[var(--border)] dark:hover:bg-[var(--bg-light)]"
                                title="Clear search"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <section className="animate-fade-in-up bg-white py-16 dark:bg-[var(--bg)]">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <span className="mb-2 inline-block rounded-full bg-[var(--bg-light)] px-4 py-1 text-sm font-medium text-[var(--primary)]">
                                EVENTS & PROGRAMS
                            </span>
                            <h2 className="text-3xl font-bold text-[var(--text)]">Upcoming Activities</h2>
                        </div>

                        <div className="mt-4 flex items-center gap-2 overflow-x-auto md:mt-0 md:flex-wrap md:overflow-visible">
                            <button
                                className={`cursor-pointer shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                                    activeFilter === null
                                        ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-md'
                                        : 'border-gray-200 bg-white text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] dark:border-[var(--border)] dark:bg-[var(--bg-light)]'
                                }`}
                                onClick={() => handleFilterClick(null)}
                            >
                                All
                            </button>

                            {categories.map((category) => {
                                const catColor = getCategoryColor(category.color);
                                const isActive = activeFilter === category.name;
                                return (
                                    <button
                                        key={category.id}
                                        className={`inline-flex cursor-pointer shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                                            isActive
                                                ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-md'
                                                : 'border-gray-200 bg-white text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] dark:border-[var(--border)] dark:bg-[var(--bg-light)]'
                                        }`}
                                        onClick={() => handleFilterClick(category.name)}
                                    >
                                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: catColor }} />
                                        {category.name}
                                        <span className="text-xs opacity-70">({categoryCounts[category.name] || 0})</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {filteredAnnouncements.map((announcement) => (
                            <Link
                                key={announcement.id}
                                href={route('guest.announcements.show', { announcement: announcement.slug })}
                                className="card-clickable group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[var(--border)] dark:bg-[var(--bg-card)]"
                            >
                                <div className="relative h-48 shrink-0 overflow-hidden">
                                    {announcement.image_url && !erroredImages.has(announcement.id) ? (
                                        <img
                                            src={announcement.image_url}
                                            alt={announcement.title}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                            onError={() => handleImageError(announcement.id)}
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-[var(--bg)] dark:to-[var(--bg)]" />
                                    )}
                                </div>
                                <div className="flex h-full flex-col p-6 pt-5">
                                    <span
                                        className={`mb-2 inline-flex w-fit rounded-full ${getCategoryColorClass(announcement.category.color)} px-2.5 py-0.5 text-[11px] font-medium text-white`}
                                    >
                                        {announcement.category.name}
                                    </span>
                                    <h3 className="mb-2 text-lg font-semibold leading-snug text-[var(--text)]">
                                        {announcement.title}
                                    </h3>
                                    <p
                                        className="mb-4 flex-1 text-sm leading-relaxed text-[var(--text-muted)]"
                                        style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {announcement.summary}
                                    </p>
                                    <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                                        <span className="text-xs text-[var(--text-muted)]">{announcement.date}</span>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                shareAnnouncement(announcement);
                                            }}
                                            className="flex cursor-pointer items-center gap-1 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]"
                                        >
                                            {sharedId === announcement.id ? (
                                                <Check className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                                            ) : (
                                                <Share2 className="h-3.5 w-3.5" />
                                            )}
                                            <span className={sharedId === announcement.id ? 'text-green-500 dark:text-green-400' : ''}>
                                                {sharedId === announcement.id ? 'Copied!' : 'Share'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {pagination.total > 0 && (
                        <div className="mb-6 text-center text-sm text-[var(--text-muted)]">
                            Showing <span className="font-medium text-[var(--text)]">{pagination.from}</span>–
                            <span className="font-medium text-[var(--text)]">{pagination.to}</span> of{' '}
                            <span className="font-medium text-[var(--text)]">{pagination.total}</span> announcement{pagination.total !== 1 ? 's' : ''}
                        </div>
                    )}

                    <Pagination pagination={pagination} onPageChange={handlePageChange} />

                    {filteredAnnouncements.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-[var(--bg-light)]">
                                <Megaphone size={40} className="text-[var(--text-muted)]" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-[var(--text)]">No announcements found</h3>
                            <p className="mb-6 max-w-md text-[var(--text-muted)]">
                                {searchQuery || activeFilter
                                    ? 'No announcements match your search criteria. Try adjusting your filters.'
                                    : 'There are no announcements available at the moment. Check back later for updates.'}
                            </p>
                            {(searchQuery || activeFilter) && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setActiveFilter(null);
                                    }}
                                    className="cursor-pointer rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[var(--primary)]/90"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <section className="animate-fade-in-up bg-[#006666] py-16 text-white">
                <div className="container mx-auto px-6 text-center lg:px-8">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">Want to receive updates directly?</h2>
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
                        Follow our latest announcements to stay up-to-date with community programs and events.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
                        <Link
                            href={route('guest.contact')}
                            className="inline-flex cursor-pointer items-center rounded-md border-2 border-white/60 px-8 py-3 font-medium text-white transition-all hover:border-white hover:bg-white/10"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
