import { Button } from '@/components/ui/button';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Share2, Sparkles, User } from 'lucide-react';
import { useState } from 'react';

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

function getCategoryColor(categoryColor: string) {
    const colorMap: Record<string, string> = {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        success: 'var(--success)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
        info: 'var(--info)',
    };

    return colorMap[categoryColor] || 'var(--primary)';
}

export default function ShowAnnouncement({ announcement }: ShowAnnouncementProps) {
    const [copied, setCopied] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
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
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <GuestLayout title={announcement.title}>
            <Head title={announcement.title} />

            <style>{`
                .guest-gradient-text {
                    background: linear-gradient(90deg, var(--primary), hsl(180, 80%, 30%));
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                }
            `}</style>

            <section className="relative overflow-hidden bg-gradient-to-br from-[var(--bg-light)] via-white to-[var(--bg)] pt-24 pb-12">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="mb-8">
                        <Link
                            href="/guest/announcements"
                            className="inline-flex items-center text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            Back to Announcements
                        </Link>
                    </div>

                    <div className="mb-4">
                        <span
                            className="inline-block rounded-full px-4 py-2 text-sm font-medium text-white shadow-sm"
                            style={{ backgroundColor: getCategoryColor(announcement.category.color) }}
                        >
                            {announcement.category.name}
                        </span>
                    </div>

                    <h1 className="mb-6 text-3xl leading-tight font-bold text-[var(--text)] md:text-4xl lg:text-5xl">{announcement.title}</h1>

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
                            className="flex items-center gap-2 text-[var(--primary)] transition-all hover:text-[var(--primary)]/80"
                        >
                            <Share2 size={18} />
                            <span>{copied ? 'Link copied!' : 'Share'}</span>
                        </button>
                    </div>
                </div>
            </section>

            <section className="bg-white py-16 dark:bg-[var(--bg)]">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        {announcement.image && (
                            <div className="mb-12 overflow-hidden rounded-2xl shadow-lg">
                                <img src={`/storage/${announcement.image}`} alt={announcement.title} className="h-[400px] w-full object-cover" />
                            </div>
                        )}

                        <div className="mb-8 rounded-2xl bg-[var(--bg-light)] p-8">
                            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-[var(--text)]">
                                <Sparkles className="h-5 w-5 text-[var(--primary)]" />
                                Summary
                            </h2>
                            <p className="text-lg leading-relaxed text-[var(--text-muted)]">{announcement.summary}</p>
                        </div>

                        <div className="prose prose-lg max-w-none">
                            <div
                                className="leading-relaxed whitespace-pre-line text-[var(--text)]"
                                style={{ fontSize: '1.125rem', lineHeight: '1.75' }}
                            >
                                {announcement.content}
                            </div>
                        </div>

                        {announcement.end_date && (
                            <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-6">
                                <h3 className="mb-2 font-semibold text-amber-800">Event Duration</h3>
                                <p className="text-amber-700">This announcement is valid until {formatDate(announcement.end_date)}</p>
                            </div>
                        )}

                        <div className="mt-16 flex flex-col items-center justify-center gap-4 rounded-2xl bg-[var(--bg-light)] p-8 text-center md:flex-row">
                            <div className="mr-0 md:mr-6">
                                <h3 className="mb-2 text-xl font-semibold text-[var(--text)]">Stay Connected</h3>
                                <p className="text-[var(--text-muted)]">Don&apos;t miss our latest updates and announcements</p>
                            </div>
                            <div className="flex gap-4">
                                <Link href="/guest/announcements">
                                    <Button variant="outline" className="rounded-full">
                                        View All Announcements
                                    </Button>
                                </Link>
                                <Link href="/guest/contact">
                                    <Button className="rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90">
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
