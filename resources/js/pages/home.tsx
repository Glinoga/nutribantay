import GuestLayout from '@/layouts/guest-layout';
import { route } from '@/lib/routes';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, CalendarCheck, Check, Heart, Share2, TrendingUp } from 'lucide-react';
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

type SiteContentMap = Record<string, { key: string; value: string | null }>;

interface HomeProps {
    announcements: Announcement[];
    maintenance?: string | null;
    siteContent?: SiteContentMap;
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

export default function Home({ announcements = [], maintenance = null, siteContent = {} }: HomeProps) {
    const { logoUrl } = usePage<{ logoUrl: string }>().props;
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

    return (
        <GuestLayout title="Home">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
                .stat-card {
                    border-top: 4px solid transparent;
                }
                .stat-card:nth-child(1) { border-top-color: var(--primary); }
                .stat-card:nth-child(2) { border-top-color: var(--secondary); }
                .stat-card:nth-child(3) { border-top-color: #d97706; }

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

            {maintenance && (
                <div
                    className="mb-8 border-l-4 border-red-500 bg-red-100 p-4 text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300"
                    role="alert"
                >
                    <div className="flex items-center">
                        <svg className="mr-3 h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <p className="font-semibold">{maintenance}</p>
                    </div>
                </div>
            )}
            <section className="animate-fade-in-up relative overflow-hidden bg-gradient-to-br from-[var(--bg-light)] to-[var(--bg)] pt-24 pb-20 md:pt-32 md:pb-28">
                <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[var(--primary)] opacity-[0.06]" />
                <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[var(--secondary)] opacity-[0.06]" />

                <div className="container mx-auto px-6 lg:px-8">
                    <div className="grid items-center gap-12 md:grid-cols-5">
                        <div className="md:col-span-3">
                            <div className="mb-4 flex items-center gap-3">
                                <img src={logoUrl} alt="NutriBantay" width="40" height="40" className="h-8 w-auto md:h-10" />
                                <span className="text-lg font-bold text-[var(--primary)] md:text-xl">NutriBantay</span>
                            </div>

                            <h1 className="mb-6 text-4xl leading-tight font-bold text-[var(--text)] md:text-5xl lg:text-6xl">
                                {siteContent.hero_title?.value ?? 'Every Child Deserves a Healthy Start'}
                            </h1>

                            <p className="mb-8 max-w-xl text-lg leading-relaxed text-[var(--text-muted)] md:text-xl">
                                {siteContent.hero_description?.value ?? 'NutriBantay monitors nutrition, vaccines, and growth for children under 5 in your barangay. We help families build a healthier future.'}
                            </p>

                            <div className="flex flex-col gap-4 sm:flex-row">
                                <a
                                    href="#announcements"
                                    className="inline-flex items-center justify-center rounded-md bg-[#008080] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#006666] hover:shadow-md"
                                >
                                    <span>{siteContent.cta_primary_label?.value ?? 'View Announcements'}</span>
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </a>
                                <Link
                                    href={route('guest.contact')}
                                    className="inline-flex items-center justify-center rounded-md border-2 border-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary)] transition-all hover:bg-[var(--primary)] hover:text-white"
                                >
                                    <span>{siteContent.cta_secondary_label?.value ?? 'Contact the Health Center'}</span>
                                </Link>
                            </div>
                        </div>

                        <div className="relative hidden md:col-span-2 md:block">
                            <div className="relative mx-auto h-80 w-80 lg:h-96 lg:w-96">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-100/60 to-cyan-100/60 dark:from-[var(--bg)] dark:to-[var(--bg-dark)]" />
                                <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[var(--primary)]/10 to-teal-400/10 lg:h-56 lg:w-56" />
                                <div className="absolute top-1/2 left-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 shadow-inner dark:bg-[var(--bg-light)]/80">
                                    <img
                                        src={logoUrl}
                                        alt=""
                                        width="48"
                                        height="48"
                                        className="absolute top-1/2 left-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2"
                                    />
                                </div>
                                <div className="absolute top-8 right-4 h-3 w-3 rounded-full bg-[var(--primary)]/30" />
                                <div className="absolute bottom-12 left-6 h-4 w-4 rounded-full bg-[var(--secondary)]/30" />
                                <div className="absolute top-1/2 -right-2 h-2 w-2 rounded-full bg-amber-400/40" />
                            </div>
                        </div>
                    </div>

                    <div className="relative mx-auto mt-16 max-w-5xl">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                            <div className="stat-card rounded-xl bg-white p-6 shadow-sm dark:bg-[var(--bg-card)]">
                                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                                    <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
                                </div>
                                <h3 className="text-3xl font-bold text-[var(--text)]">{siteContent.stat_1_value?.value ?? '500+'}</h3>
                                <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">{siteContent.stat_1_label?.value ?? 'Children Monitored'}</p>
                                <p className="mt-0.5 text-xs text-[var(--text-muted)]/70">{siteContent.stat_1_subtitle?.value ?? 'Since 2022'}</p>
                            </div>
                            <div className="stat-card rounded-xl bg-white p-6 shadow-sm dark:bg-[var(--bg-card)]">
                                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--secondary)]/10">
                                    <CalendarCheck className="h-5 w-5 text-[var(--secondary)]" />
                                </div>
                                <h3 className="text-3xl font-bold text-[var(--text)]">{siteContent.stat_2_value?.value ?? '50+'}</h3>
                                <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">{siteContent.stat_2_label?.value ?? 'Health Programs'}</p>
                                <p className="mt-0.5 text-xs text-[var(--text-muted)]/70">{siteContent.stat_2_subtitle?.value ?? 'As of June 2026'}</p>
                            </div>
                            <div className="stat-card rounded-xl bg-white p-6 shadow-sm dark:bg-[var(--bg-card)]">
                                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20">
                                    <Heart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <h3 className="text-3xl font-bold text-[var(--text)]">{siteContent.stat_3_value?.value ?? '200+'}</h3>
                                <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">{siteContent.stat_3_label?.value ?? 'Families Assisted'}</p>
                                <p className="mt-0.5 text-xs text-[var(--text-muted)]/70">{siteContent.stat_3_subtitle?.value ?? 'Since 2022'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="announcements" className="animate-fade-in-up bg-white py-20 dark:bg-[var(--bg)]">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div>
                            <span className="mb-2 inline-block rounded-full bg-[var(--bg-light)] px-4 py-1 text-sm font-medium text-[var(--primary)]">
                                STAY UPDATED
                            </span>
                            <h2 className="text-3xl font-bold text-[var(--text)] md:text-4xl">Latest Announcements</h2>
                        </div>
                        <Link
                            href={route('guest.announcements')}
                            className="inline-flex items-center rounded-full border-2 border-[var(--primary)] px-6 py-2 text-[var(--primary)] transition-all hover:bg-[var(--primary)] hover:text-white"
                        >
                            <span>View All</span>
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {announcements.length > 0 ? (
                            announcements.map((announcement) => (
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
                                        <h3 className="mb-2 text-lg leading-snug font-semibold text-[var(--text)]">{announcement.title}</h3>
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
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center">
                                <p className="text-lg text-[var(--text-muted)]">No announcements available at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="bg-[#006666] py-16">
                <div className="container mx-auto px-6 text-center lg:px-8">
                    <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">{siteContent.cta_heading?.value ?? "Have questions about your child's nutrition?"}</h2>
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
                        {siteContent.cta_text?.value ?? 'Our team at the barangay health center is ready to help. Reach out to learn about our monitoring program, vaccine schedules, and how we can support your family.'}
                    </p>
                    <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
                        <Link
                            href={route('guest.contact')}
                            className="inline-flex items-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-[#006666] shadow-sm transition-all hover:bg-gray-100 hover:shadow-md"
                        >
                            {siteContent.cta_button_label?.value ?? 'Contact the Health Center'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
