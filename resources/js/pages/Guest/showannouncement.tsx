import GuestLayout from '@/layouts/guest-layout';
import { route } from '@/lib/routes';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Check, ChevronRight, Share2, User } from 'lucide-react';
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
    image_url?: string | null;
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

export default function ShowAnnouncement({ announcement, relatedAnnouncements = [] }: ShowAnnouncementProps) {
    const [copied, setCopied] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [relatedSharedId, setRelatedSharedId] = useState<number | null>(null);
    const [relatedErrored, setRelatedErrored] = useState<Set<number>>(new Set());

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
            setRelatedSharedId(related.id);
            setTimeout(() => setRelatedSharedId(null), 2000);
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
                .scrollable-cards {
                    scrollbar-width: thin;
                    scrollbar-color: #cbd5e1 transparent;
                }
                .dark .scrollable-cards {
                    scrollbar-color: #475569 transparent;
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

            <section className="animate-fade-in-up relative overflow-hidden bg-gradient-to-br from-[var(--bg-light)] via-white to-[var(--bg)] pt-24 pb-12 dark:via-[var(--bg)]">
                <div className="container mx-auto px-6 lg:px-8">
                    <nav className="mb-8 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <Link href="/" className="transition-colors hover:text-[var(--primary)]">
                            Home
                        </Link>
                        <ChevronRight size={14} />
                        <Link href={route('guest.announcements')} className="transition-colors hover:text-[var(--primary)]">
                            Announcements
                        </Link>
                        <ChevronRight size={14} />
                        <span className="max-w-[200px] truncate text-[var(--text)] lg:max-w-[400px]">{announcement.title}</span>
                    </nav>

                    <div className="mb-4">
                        <span
                            className="inline-block rounded-full px-4 py-2 text-sm font-medium text-white shadow-sm"
                            style={{ backgroundColor: getCategoryColor(announcement.category.color) }}
                        >
                            {announcement.category.name}
                        </span>
                    </div>

                    <h1 className="mb-6 text-3xl leading-tight font-bold text-[var(--text)] md:text-4xl lg:text-5xl">{announcement.title}</h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--text-muted)]">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} />
                            <div>
                                <span className="font-medium text-[var(--text)]">Published</span>
                                <span className="ml-1">{formatDate(announcement.date)}</span>
                            </div>
                        </div>
                        {announcement.end_date && (
                            <div className="flex items-center gap-2">
                                <Calendar size={18} />
                                <div>
                                    <span className="font-medium text-[var(--text)]">Valid until</span>
                                    <span className="ml-1">{formatDate(announcement.end_date)}</span>
                                </div>
                            </div>
                        )}
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
                        {announcement.image_url && !imgError ? (
                            <figure className="mb-12">
                                <div className="overflow-hidden rounded-xl shadow-md">
                                    <img
                                        src={announcement.image_url}
                                        alt={announcement.title}
                                        className="h-[400px] w-full object-cover"
                                        onError={() => setImgError(true)}
                                    />
                                </div>
                                <figcaption className="mt-3 text-center text-sm text-[var(--text-muted)] italic">{announcement.title}</figcaption>
                            </figure>
                        ) : announcement.image_url && imgError ? (
                            <div className="mb-12 h-[400px] overflow-hidden rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 shadow-md dark:from-[var(--bg)] dark:to-[var(--bg)]" />
                        ) : null}

                        <div className="mx-auto max-w-2xl">
                            <div
                                className="prose prose-lg max-w-none leading-relaxed text-[var(--text)]"
                                style={{ fontSize: '1.125rem', lineHeight: '1.85' }}
                            >
                                <div className="space-y-6 whitespace-pre-line">{announcement.content}</div>
                            </div>

                            {announcement.end_date && (
                                <div className="mt-12 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-6 dark:border-amber-600 dark:bg-amber-900/20">
                                    <h3 className="mb-2 font-semibold text-amber-800 dark:text-amber-300">Event Duration</h3>
                                    <p className="text-amber-700 dark:text-amber-400">
                                        This announcement is valid until {formatDate(announcement.end_date)}
                                    </p>
                                </div>
                            )}
                        </div>

                        {relatedAnnouncements.length > 0 && (
                            <div className="mt-16">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-[var(--text)]">Related Announcements</h2>
                                    <p className="mt-2 text-[var(--text-muted)]">You might also be interested in</p>
                                </div>
                                <div className="scrollable-cards flex gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3">
                                    {relatedAnnouncements.slice(0, 3).map((related) => (
                                        <Link
                                            key={related.id}
                                            href={route('guest.announcements.show', { announcement: related.slug })}
                                            className="card-clickable group flex h-full min-w-[280px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:min-w-0 dark:border-[var(--border)] dark:bg-[var(--bg-card)]"
                                        >
                                            <div className="relative h-40 shrink-0 overflow-hidden">
                                                {related.image_url && !relatedErrored.has(related.id) ? (
                                                    <img
                                                        src={related.image_url}
                                                        alt={related.title}
                                                        className="h-full w-full object-cover"
                                                        loading="lazy"
                                                        onError={() => setRelatedErrored((prev) => new Set([...prev, related.id]))}
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-[var(--bg)] dark:to-[var(--bg)]" />
                                                )}
                                            </div>
                                            <div className="flex flex-1 flex-col p-5">
                                                <span
                                                    className={`mb-2 inline-flex w-fit rounded-full ${getCategoryColorClass(related.category.color)} px-2.5 py-0.5 text-[11px] font-medium text-white`}
                                                >
                                                    {related.category.name}
                                                </span>
                                                <h3 className="mb-2 text-base leading-snug font-semibold text-[var(--text)]">{related.title}</h3>
                                                <p
                                                    className="mb-3 flex-1 text-sm leading-relaxed text-[var(--text-muted)]"
                                                    style={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    {related.summary}
                                                </p>
                                                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                                                    <span className="text-xs text-[var(--text-muted)]">{related.date}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleRelatedShare(related);
                                                        }}
                                                        className="flex cursor-pointer items-center gap-1 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]"
                                                    >
                                                        {relatedSharedId === related.id ? (
                                                            <Check className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                                                        ) : (
                                                            <Share2 className="h-3.5 w-3.5" />
                                                        )}
                                                        <span className={relatedSharedId === related.id ? 'text-green-500 dark:text-green-400' : ''}>
                                                            {relatedSharedId === related.id ? 'Copied!' : 'Share'}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="animate-fade-in-up bg-[#006666] py-16 text-white">
                <div className="container mx-auto px-6 text-center lg:px-8">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">Need more information?</h2>
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
                        Our team is ready to answer any questions you may have about our programs and services.
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
