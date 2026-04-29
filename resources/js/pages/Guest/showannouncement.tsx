import GuestLayout from '@/layouts/guest-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define interface for the announcement
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

interface ShowAnnouncementProps {
    announcement: Announcement;
}

// get color class based on category
function getCategoryColorClass(categoryColor: string) {
    const colorMap: Record<string, string> = {
        'primary': 'var(--primary)',
        'secondary': 'var(--secondary)',
        'success': 'var(--success)',
        'danger': 'var(--danger)',
        'warning': 'var(--warning)',
        'info': 'var(--info)',
    };

    return colorMap[categoryColor] || 'var(--primary)';
}

export default function ShowAnnouncement({ announcement }: ShowAnnouncementProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: announcement.title,
                text: announcement.summary,
                url: window.location.href,
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            // You could add a toast notification here
        }
    };

    return (
        <GuestLayout title={announcement.title}>
            <Head title={announcement.title} />
            
            {/* Header Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[var(--bg-light)] to-[var(--bg)] pt-24 pb-12">
                <div className="container mx-auto px-6 lg:px-8">
                    {/* Back Button */}
                    <div className="mb-8">
                        <Link
                            href="/guest/announcements"
                            className="inline-flex items-center text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            Back to Announcements
                        </Link>
                    </div>

                    {/* Category Badge */}
                    <div className="mb-4">
                        <span 
                            className="inline-block rounded-full px-4 py-2 text-sm font-medium text-white"
                            style={{ backgroundColor: getCategoryColorClass(announcement.category.color) }}
                        >
                            {announcement.category.name}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="mb-6 text-3xl font-bold leading-tight text-[var(--text)] md:text-4xl lg:text-5xl">
                        {announcement.title}
                    </h1>

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-6 text-[var(--text-muted)]">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} />
                            <span>{formatDate(announcement.date)}</span>
                        </div>
                        {announcement.author && (
                            <div className="flex items-center gap-2">
                                <User size={18} />
                                <span>By {announcement.author}</span>
                            </div>
                        )}
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors"
                        >
                            <Share2 size={18} />
                            <span>Share</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 bg-white dark:bg-[var(--bg)]">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        {/* Featured Image */}
                        {announcement.image && (
                            <div className="mb-12 overflow-hidden rounded-2xl shadow-lg">
                                <img
                                    src={`/storage/${announcement.image}`}
                                    alt={announcement.title}
                                    className="h-[400px] w-full object-cover"
                                />
                            </div>
                        )}

                        {/* Summary */}
                        <div className="mb-8 rounded-2xl bg-[var(--bg-light)] p-8">
                            <h2 className="mb-4 text-xl font-semibold text-[var(--text)]">Summary</h2>
                            <p className="text-lg leading-relaxed text-[var(--text-muted)]">
                                {announcement.summary}
                            </p>
                        </div>

                        {/* Content */}
                        <div className="prose prose-lg max-w-none">
                            <div 
                                className="text-[var(--text)] leading-relaxed whitespace-pre-line"
                                style={{ fontSize: '1.125rem', lineHeight: '1.75' }}
                            >
                                {announcement.content}
                            </div>
                        </div>

                        {/* End Date Notice */}
                        {announcement.end_date && (
                            <div className="mt-12 rounded-2xl border border-[var(--warning)] bg-[var(--warning)]/10 p-6">
                                <h3 className="mb-2 font-semibold text-[var(--warning)]">
                                    📅 Event Duration
                                </h3>
                                <p className="text-[var(--text-muted)]">
                                    This announcement is valid until {formatDate(announcement.end_date)}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-16 flex flex-col items-center justify-center gap-4 rounded-2xl bg-[var(--bg-light)] p-8 text-center md:flex-row">
                            <div className="mr-0 md:mr-6">
                                <h3 className="mb-2 text-xl font-semibold text-[var(--text)]">
                                    Stay Connected
                                </h3>
                                <p className="text-[var(--text-muted)]">
                                    Don't miss our latest updates and announcements
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <Link href="/guest/announcements">
                                    <Button variant="outline" className="rounded-full">
                                        View All Announcements
                                    </Button>
                                </Link>
                                <Link href="/guest/contact">
                                    <Button className="rounded-full">
                                        Contact Us
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
