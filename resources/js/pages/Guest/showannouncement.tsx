import AnnouncementCard from '@/components/announcement-card';
import { Button } from '@/components/ui/button';
import GuestLayout from '@/layouts/guest-layout';
import { route } from '@/lib/routes';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, HeartHandshake, Share2, User } from 'lucide-react';
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
}

interface ShowAnnouncementProps {
    announcement: Announcement;
    relatedAnnouncements?: Announcement[];
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

export default function ShowAnnouncement({ announcement, relatedAnnouncements = [] }: ShowAnnouncementProps) {
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

    const handleRelatedShare = (related: Announcement) => {
        const url = `${window.location.origin}/guest/announcements/${related.slug}`;
        if (navigator.share) {
            navigator.share({
                title: related.title,
                text: related.summary,
                url,
            });
        } else {
            navigator.clipboard.writeText(url);
        }
    };

    return (
        <GuestLayout title={announcement.title}>
            <Head title={announcement.title} />

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
            `}</style>

            <section className="animate-fade-in-up relative overflow-hidden bg-gradient-to-br from-[var(--bg-light)] via-white to-[var(--bg)] pt-24 pb-12">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="mb-8">
                        <Link
                            href={route('guest.announcements')}
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
                            className="flex cursor-pointer items-center gap-2 text-[var(--primary)] transition-all hover:text-[var(--primary)]/80"
                        >
                            <Share2 size={18} />
                            <span>{copied ? 'Link copied!' : 'Share'}</span>
                        </button>
                    </div>
                </div>
            </section>

            <section className="animate-fade-in-up bg-white py-16 dark:bg-[var(--bg)]">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        {announcement.image && (
                            <div className="mb-12 overflow-hidden rounded-2xl shadow-lg">
                                <img src={`/storage/${announcement.image}`} alt={announcement.title} className="h-[400px] w-full object-cover" />
                            </div>
                        )}

                        <div
                            className="prose prose-lg max-w-none leading-relaxed whitespace-pre-line text-[var(--text)]"
                            style={{ fontSize: '1.125rem', lineHeight: '1.85' }}
                        >
                            {announcement.content}
                        </div>

                        {announcement.end_date && (
                            <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50/80 p-6 backdrop-blur-sm">
                                <h3 className="mb-2 font-semibold text-amber-800">Event Duration</h3>
                                <p className="text-amber-700">This announcement is valid until {formatDate(announcement.end_date)}</p>
                            </div>
                        )}

                        <div className="mt-16 flex flex-col items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-teal-50 to-cyan-50 p-8 text-center md:flex-row">
                            <div className="mr-0 md:mr-6">
                                <h3 className="mb-2 text-xl font-semibold text-[var(--text)]">Stay Connected</h3>
                                <p className="text-[var(--text-muted)]">Don&apos;t miss our latest updates and announcements</p>
                            </div>
                            <div className="flex gap-4">
                                <Link href={route('guest.announcements')}>
                                    <Button variant="outline" className="cursor-pointer rounded-full border-teal-600 text-teal-700 hover:bg-teal-700 hover:text-white">
                                        View All Announcements
                                    </Button>
                                </Link>
                                <Link href={route('guest.contact')}>
                                    <Button className="cursor-pointer rounded-full bg-gradient-to-r from-teal-700 to-cyan-600 text-white hover:from-teal-800 hover:to-cyan-700">
                                        Contact Us
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {relatedAnnouncements.length > 0 && (
                            <div className="mt-16">
                                <div className="mb-8 text-center">
                                    <h2 className="text-2xl font-bold text-[var(--text)]">Related Announcements</h2>
                                    <p className="mt-2 text-[var(--text-muted)]">You might also be interested in</p>
                                </div>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {relatedAnnouncements.slice(0, 3).map((related) => (
                                        <AnnouncementCard
                                            key={related.id}
                                            announcement={related}
                                            variant="default"
                                            lineClamp={3}
                                            onShare={() => handleRelatedShare(related)}
                                            renderActions={() => (
                                                <Link href={route('guest.announcements.show', { announcement: related.slug })}>
                                                    <Button
                                                        className="cursor-pointer rounded-full border border-[var(--border-muted)] bg-white px-4 py-2 text-sm font-medium text-[var(--primary)] shadow-sm transition-all hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
                                                        size="sm"
                                                    >
                                                        Read More
                                                    </Button>
                                                </Link>
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="animate-fade-in-up relative overflow-hidden bg-gradient-to-br from-[var(--primary)] to-teal-900 py-16 text-white">
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-teal-600 opacity-20" />
                <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-600 opacity-20" />
                <div className="relative container mx-auto px-6 text-center lg:px-8">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">Join Our Mission for a Healthier Community</h2>
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
                        Help us make a difference in the lives of children and families in our barangay.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
                        <Link
                            href={route('register')}
                            className="inline-flex cursor-pointer items-center rounded-full bg-white px-8 py-3 font-semibold text-[var(--primary)] shadow-lg transition-all hover:bg-[var(--bg-light)] hover:shadow-xl"
                        >
                            <HeartHandshake className="mr-2 h-5 w-5" />
                            Get Started Today
                        </Link>
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
