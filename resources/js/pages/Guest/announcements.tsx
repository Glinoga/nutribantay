import GuestLayout from '@/layouts/guest-layout';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { route } from '@/lib/routes';

// get color class based on category
function getCategoryColorClass(categoryColor: string) {
    const colorMap: Record<string, string> = {
        'primary': 'bg-[var(--primary)]',
        'secondary': 'bg-[var(--secondary)]',
        'success': 'bg-[var(--success)]',
        'danger': 'bg-[var(--danger)]',
        'warning': 'bg-[var(--warning)]',
        'info': 'bg-[var(--info)]',
    };

    return colorMap[categoryColor] || 'bg-[var(--primary)]';
}

// Define interface for the announcements
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
}

interface AnnouncementsProps {
    announcements: Announcement[];
}

export default function Announcements({ announcements }: AnnouncementsProps) {

    const [searchQuery, setSearchQuery] = useState('');

    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const categories = useMemo(() => {
        const uniqueCategories = new Set<string>();
        announcements.forEach(announcement => {
            if (announcement.category && announcement.category.name) {
                uniqueCategories.add(announcement.category.name);
            }
        });
        return Array.from(uniqueCategories.values());
    }, [announcements]);

    const filteredAnnouncements = useMemo(() => {
        return announcements.filter(announcement => {
            // Apply search filter
            const matchesSearch = searchQuery === '' ||
                announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                announcement.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                announcement.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                announcement.category.name.toLowerCase().includes(searchQuery.toLowerCase());

            // Apply category filter
            const matchesCategory = activeFilter === null ||
                (announcement.category && announcement.category.name === activeFilter);

            return matchesSearch && matchesCategory;
        });
    }, [announcements, searchQuery, activeFilter]);

    const handleResetClick = () => {
        setSearchQuery('');
        setActiveFilter(null);
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleFilterClick = (category: string | null) => {
        setActiveFilter(category === activeFilter ? null : category);
    };

    const handleSearchReset = () => {
        setSearchQuery('');
    };

    return (
        <GuestLayout title="Announcements">
            <Head title="Announcements" />
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[var(--bg-light)] to-[var(--bg)] pt-24 pb-20 md:pt-28 md:pb-20">
                <div className="absolute top-0 left-0 -z-10 h-full w-1/2 opacity-20 md:opacity-30">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="var(--secondary)" d="M42.8,-73.2C55.9,-67.3,67.2,-56.9,74.3,-44C81.5,-31,84.5,-15.5,83.8,-0.4C83.2,14.8,78.8,29.5,71.6,42.9C64.3,56.3,54.2,68.2,41.5,75.8C28.8,83.3,14.4,86.3,-0.3,86.9C-15.1,87.5,-30.2,85.6,-41.7,78C-53.3,70.4,-61.3,57.1,-66.6,43.7C-72,30.3,-74.7,15.1,-76.3,-0.9C-78,-16.9,-78.6,-33.8,-72,-47.2C-65.4,-60.6,-51.6,-70.4,-37.4,-75.5C-23.3,-80.6,-8.8,-80.9,3.1,-76.5C15,-72,29.8,-79.1,42.8,-73.2Z" transform="translate(100 100)" />
                    </svg>
                </div>

                <div className="container mx-auto px-6 text-center lg:px-8">
                    <span className="mb-2 inline-block rounded-full bg-[var(--bg)] px-4 py-1 text-sm font-medium text-[var(--secondary)]">
                        COMMUNITY UPDATES
                    </span>
                    <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                        <span className="gradient-text">Latest Announcements</span>
                    </h1>
                    <p className="mx-auto mb-10 max-w-2xl text-lg text-[var(--text-muted)] md:text-xl">
                        Stay informed about upcoming events, programs, and initiatives in our community
                    </p>

                    {/* Search Bar */}
                    <div className="relative z-10 mx-auto mt-8 flex max-w-md items-center rounded-full border border-[var(--border)] bg-white/80 p-1 shadow-lg backdrop-blur-sm dark:bg-[var(--bg)]/80">
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-3 h-5 w-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            id="announcement-search"
                            type="text"
                            placeholder="Search announcements..."
                            className="w-full bg-transparent px-4 py-3 text-[var(--text)] focus:outline-none"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        {searchQuery && (
                            <button
                                onClick={handleSearchReset}
                                className="mr-3 rounded-full border border-2 border-[var(--border)] p-1 text-[var(--text-muted)] hover:bg-[var(--text-muted)] hover:text-white"
                                title="Clear search"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Announcements List */}
            <section className="py-16 bg-white dark:bg-[var(--bg)]">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <span className="mb-2 inline-block rounded-full bg-[var(--bg-light)] px-4 py-1 text-sm font-medium text-[var(--primary)]">
                                EVENTS & PROGRAMS
                            </span>
                            <h2 className="text-3xl font-bold text-[var(--text)]">
                                Upcoming Activities
                            </h2>
                        </div>

                        {/* Filter Button */}
                        <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
                            <button
                                className={`rounded-full border-2 border-[var(--primary)] ${activeFilter === null ? 'bg-[var(--primary)] text-white' : 'text-[var(--primary)]'} px-4 py-2 text-sm font-medium transition-colors`}
                                onClick={() => handleFilterClick(null)}
                            >
                                All
                            </button>

                            {categories.map((category) => (
                                <button
                                    key={category}
                                    className={`rounded-full border-2 border-[var(--primary)] ${activeFilter === category ? 'bg-[var(--primary)] text-white' : 'text-[var(--primary)]'} px-4 py-2 text-sm font-medium transition-colors`}
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
                                className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-xl dark:bg-[var(--bg-light)]"
                            >
                                <div className="absolute inset-x-0 top-0 h-2" style={{
                                    backgroundColor: `var(--${announcement.category.color || 'primary'})`
                                }}></div>

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
                                    <span className={`mb-3 inline-block rounded-full ${getCategoryColorClass(announcement.category.color || 'primary')} px-3 py-1 text-xs font-medium text-white`}>
                                        {announcement.category.name}
                                    </span>
                                    <h3 className="mb-2 text-xl font-semibold text-[var(--text)] group-hover:text-[var(--primary)]">
                                        {announcement.title}
                                    </h3>
                                    <p className="mb-3 text-sm text-[var(--text-muted)]">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 inline-block h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {announcement.date}
                                    </p>
                                    <div className="mb-4 h-0.5 w-16 rounded-full bg-[var(--border-muted)]"></div>
                                    <p className="mb-6 text-[var(--text)] line-clamp-4">
                                        {announcement.summary}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <Link href={route('guest.announcements.show', { announcement: announcement.id })}>
                                            <Button className='rounded-full border border-[var(--border-muted)] bg-[var(--bg-light)] px-4 py-2 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)] hover:text-white hover:border-[var(--bg-light)]' size="sm">Read More</Button>
                                        </Link>

                                        <button
                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                            title="Share"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredAnnouncements.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-lg text-[var(--text-muted)]">
                                {searchQuery || activeFilter
                                    ? "No announcements match your search criteria. Try adjusting your filters."
                                    : "No announcements available at the moment."}
                            </p>
                            {(searchQuery || activeFilter) && (
                                <button
                                    onClick={() => { setSearchQuery(''); setActiveFilter(null); }}
                                    className="mt-4 rounded-full border border-[var(--primary)] bg-[var(--bg-light)] px-4 py-2 text-sm font-medium text-[var(--primary)]"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}

                    {/* Pagination - unchanged */}
                    {filteredAnnouncements.length > 0 && (
                        <div className="mt-16 flex justify-center">
                            <div className="inline-flex rounded-md shadow">
                                <button className="inline-flex items-center justify-center rounded-l-md border border-r-0 border-[var(--border)] bg-white px-4 py-2 text-[var(--text-muted)]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button className="border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 text-white">1</button>
                                <button className="border border-[var(--border)] bg-white px-4 py-2 text-[var(--text)]">2</button>
                                <button className="border border-[var(--border)] bg-white px-4 py-2 text-[var(--text)]">3</button>
                                <button className="inline-flex items-center justify-center rounded-r-md border border-[var(--border)] bg-white px-4 py-2 text-[var(--text-muted)]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="relative overflow-hidden bg-[var(--primary)] py-16">
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[var(--secondary)] opacity-20"></div>
                <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[var(--secondary)] opacity-20"></div>

                <div className="container relative mx-auto px-6 text-center lg:px-8">
                    <h2 className="mb-auto text-3xl font-bold text-white md:text-4xl">
                        Stay Informed, Stay Healthy
                    </h2>
                </div>
            </section>
        </GuestLayout>
    );
}