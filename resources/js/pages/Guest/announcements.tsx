import { Button } from '@/components/ui/button';
import { Pagination, type PaginationData } from '@/components/ui/pagination';
import GuestLayout from '@/layouts/guest-layout';
import { route } from '@/lib/routes';
import { Head, Link, router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

function getCategoryColorClass(categoryColor: string) {
    const colorMap: Record<string, string> = {
        primary: 'bg-[var(--primary)]',
        secondary: 'bg-[var(--secondary)]',
        success: 'bg-[var(--success)]',
        danger: 'bg-[var(--danger)]',
        warning: 'bg-[var(--warning)]',
        info: 'bg-[var(--info)]',
    };

    return colorMap[categoryColor] || 'bg-[var(--primary)]';
}

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
}

export default function Announcements({ announcements, pagination }: AnnouncementsProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const categories = useMemo(() => {
        const uniqueCategories = new Set<string>();
        announcements.forEach((announcement) => {
            if (announcement.category && announcement.category.name) {
                uniqueCategories.add(announcement.category.name);
            }
        });
        return Array.from(uniqueCategories.values());
    }, [announcements]);

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

                        <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
                            <button
                                className={`rounded-full border-2 border-[var(--primary)] ${activeFilter === null ? 'bg-gradient-to-r from-teal-700 to-cyan-600 text-white' : 'text-[var(--primary)]'} px-4 py-2 text-sm font-medium transition-colors`}
                                onClick={() => handleFilterClick(null)}
                            >
                                All
                            </button>

                            {categories.map((category) => (
                                <button
                                    key={category}
                                    className={`rounded-full border-2 border-[var(--primary)] ${activeFilter === category ? 'bg-gradient-to-r from-teal-700 to-cyan-600 text-white' : 'text-[var(--primary)]'} px-4 py-2 text-sm font-medium transition-colors`}
                                    onClick={() => handleFilterClick(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {filteredAnnouncements.map((announcement) => (
                            <div
                                key={announcement.id}
                                className="group relative overflow-hidden rounded-2xl bg-white/80 shadow-md backdrop-blur-sm transition-all hover:shadow-xl"
                            >
                                    <div
                                        className="absolute inset-x-0 top-0 h-2"
                                    style={{
                                        backgroundColor: `var(--${announcement.category.color || 'primary'})`,
                                    }}
                                />

                                {announcement.image && (
                                    <div className="h-48 overflow-hidden">
                                        <img
                                            src={`/storage/${announcement.image}`}
                                            alt={announcement.title}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                )}

                                <div className="p-6 pt-8">
                                    <div className="mb-3 flex flex-wrap gap-2">
                                        <span
                                            className={`rounded-full ${getCategoryColorClass(announcement.category.color || 'primary')} px-3 py-1 text-xs font-medium text-white`}
                                        >
                                            {announcement.category.name}
                                        </span>
                                        {announcement.is_expired && (
                                            <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white">
                                                Expired
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-[var(--text)] group-hover:text-[var(--primary)]">
                                        {announcement.title}
                                    </h3>
                                    <p className="mb-3 text-sm text-[var(--text-muted)]">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="mr-1 inline-block h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                        {announcement.date}
                                    </p>
                                    <div className="mb-4 h-0.5 w-16 rounded-full bg-[var(--border-muted)]"></div>
                                    <p className="mb-6 line-clamp-4 text-[var(--text)]">{announcement.summary}</p>
                                    <div className="flex items-center justify-between">
                                        <Link href={route('guest.announcements.show', { announcement: announcement.id })}>
                                            <Button
                                                className="rounded-full border border-[var(--border-muted)] bg-white px-4 py-2 text-sm font-medium text-[var(--primary)] shadow-sm transition-all hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
                                                size="sm"
                                            >
                                                Read More
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
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
                        <div className="py-12 text-center">
                            <p className="text-lg text-[var(--text-muted)]">
                                {searchQuery || activeFilter
                                    ? 'No announcements match your search criteria. Try adjusting your filters.'
                                    : 'No announcements available at the moment.'}
                            </p>
                            {(searchQuery || activeFilter) && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setActiveFilter(null);
                                    }}
                                    className="mt-4 rounded-full border border-[var(--primary)] bg-white px-4 py-2 text-sm font-medium text-[var(--primary)] shadow-sm transition-all hover:bg-[var(--primary)] hover:text-white"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <section className="animate-fade-in-up relative overflow-hidden bg-gradient-to-br from-[var(--primary)] to-teal-800 py-16">
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-teal-600 opacity-20"></div>
                <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-600 opacity-20"></div>

                <div className="relative container mx-auto px-6 text-center lg:px-8">
                    <h2 className="mb-auto text-3xl font-bold text-white md:text-4xl">Stay Informed, Stay Healthy</h2>
                </div>
            </section>
        </GuestLayout>
    );
}
