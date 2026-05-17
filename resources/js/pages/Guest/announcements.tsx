import AnnouncementCard from '@/components/announcement-card';
import { Button } from '@/components/ui/button';
import { Pagination, type PaginationData } from '@/components/ui/pagination';
import GuestLayout from '@/layouts/guest-layout';
import { route } from '@/lib/routes';
import { Head, Link, router } from '@inertiajs/react';
import { Megaphone, Search, X } from 'lucide-react';
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

export default function Announcements({ announcements, pagination, categories }: AnnouncementsProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const [activeFilter, setActiveFilter] = useState<string | null>(null);

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
        }
    };

    const filteredAnnouncements = useMemo(() => {
        return announcements.filter((announcement) => {
            const matchesSearch =
                searchQuery === '' ||
                announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                announcement.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                announcement.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (announcement.category?.name?.toLowerCase() ?? '').includes(searchQuery.toLowerCase())

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
                .guest-gradient-text {
                    background: linear-gradient(90deg, var(--primary), hsl(180, 80%, 30%));
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
            `}</style>

            <section className="animate-fade-in-up relative overflow-hidden bg-gradient-to-br from-[var(--bg-light)] via-white to-[var(--bg)] pt-24 pb-20 md:pt-28 md:pb-20">
                <div className="absolute top-0 left-0 -z-10 h-full w-1/2 opacity-20 md:opacity-30">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path
                            fill="var(--primary)"
                            d="M42.8,-73.2C55.9,-67.3,67.2,-56.9,74.3,-44C81.5,-31,84.5,-15.5,83.8,-0.4C83.2,14.8,78.8,29.5,71.6,42.9C64.3,56.3,54.2,68.2,41.5,75.8C28.8,83.3,14.4,86.3,-0.3,86.9C-15.1,87.5,-30.2,85.6,-41.7,78C-53.3,70.4,-61.3,57.1,-66.6,43.7C-72,30.3,-74.7,15.1,-76.3,-0.9C-78,-16.9,-78.6,-33.8,-72,-47.2C-65.4,-60.6,-51.6,-70.4,-37.4,-75.5C-23.3,-80.6,-8.8,-80.9,3.1,-76.5C15,-72,29.8,-79.1,42.8,-73.2Z"
                            transform="translate(100 100)"
                        />
                    </svg>
                </div>

                <div className="container mx-auto px-6 text-center lg:px-8">
                    <span className="mb-2 inline-block rounded-full bg-white/80 px-4 py-1 text-sm font-medium text-[var(--primary)] shadow-sm backdrop-blur-sm">
                        COMMUNITY UPDATES
                    </span>
                    <h1 className="mb-6 text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
                        <span className="guest-gradient-text">Latest Announcements</span>
                    </h1>
                    <p className="mx-auto mb-10 max-w-2xl text-lg text-[var(--text-muted)] md:text-xl">
                        Stay informed about upcoming events, programs, and initiatives in our community
                    </p>

                    <div className="relative z-10 mx-auto mt-8 flex max-w-md items-center rounded-full border border-[var(--border)] bg-white/80 p-1 shadow-lg backdrop-blur-sm dark:bg-[var(--bg)]/80">
                        <Search className="ml-3 h-5 w-5 text-[var(--text-muted)]" />
                        <input
                            id="announcement-search"
                            type="text"
                            placeholder="Search announcements..."
                            className="w-full bg-transparent px-4 py-3 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-teal-500/50 rounded-full"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        {searchQuery && (
                            <button
                                onClick={handleSearchReset}
                                className="mr-3 rounded-full border-2 border-[var(--border)] p-1 text-[var(--text-muted)] hover:bg-[var(--text-muted)] hover:text-white"
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

                        <div className="mt-4 flex flex-wrap items-center gap-2 md:mt-0">
                            <button
                                className={`cursor-pointer rounded-full border ${activeFilter === null ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-md' : 'border-[var(--border)] bg-white text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]'} px-4 py-2 text-sm font-medium transition-all`}
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
                                        className={`cursor-pointer inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                                            isActive
                                                ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-md'
                                                : 'border-[var(--border)] bg-white text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                                        }`}
                                        onClick={() => handleFilterClick(category.name)}
                                    >
                                        <span
                                            className="h-2.5 w-2.5 rounded-full"
                                            style={{ backgroundColor: catColor }}
                                        />
                                        {category.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {filteredAnnouncements.map((announcement) => (
                            <AnnouncementCard
                                key={announcement.id}
                                announcement={announcement}
                                variant="default"
                                lineClamp={4}
                                onShare={shareAnnouncement}
                                renderActions={() => (
                                    <Link href={route('guest.announcements.show', { announcement: announcement.slug })}>
                                        <Button
                                            className="rounded-full border border-[var(--border-muted)] bg-white px-4 py-2 text-sm font-medium text-[var(--primary)] shadow-sm transition-all hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
                                            size="sm"
                                        >
                                            Read More
                                        </Button>
                                    </Link>
                                )}
                            />
                        ))}
                    </div>

                    {pagination.total > 0 && (
                        <div className="mb-6 text-center text-sm text-[var(--text-muted)]">
                            Showing{' '}
                            <span className="font-medium text-[var(--text)]">{pagination.from}</span>
                            –<span className="font-medium text-[var(--text)]">{pagination.to}</span>
                            {' '}of{' '}
                            <span className="font-medium text-[var(--text)]">{pagination.total}</span>{' '}
                            announcement{pagination.total !== 1 ? 's' : ''}
                        </div>
                    )}

                    <Pagination pagination={pagination} onPageChange={handlePageChange} />

                    {filteredAnnouncements.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-light)]">
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
                                    className="cursor-pointer rounded-full bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-[var(--primary)]/90"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <section className="animate-fade-in-up relative overflow-hidden bg-gradient-to-br from-[var(--primary)] to-teal-900 py-16 text-white">
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-teal-600 opacity-20" />
                <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-600 opacity-20" />
                <div className="relative container mx-auto px-6 text-center lg:px-8">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">Stay Informed, Stay Healthy</h2>
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
                        Follow our latest announcements to stay up-to-date with community programs and events.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
                        <Link
                            href={route('guest.contact')}
                            className="inline-flex cursor-pointer items-center rounded-full border-2 border-white/60 px-8 py-3 font-medium text-white transition-all hover:border-white hover:bg-white/10"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
