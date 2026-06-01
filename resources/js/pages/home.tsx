import { Button } from '@/components/ui/button';
import GuestLayout from '@/layouts/guest-layout';
import { route } from '@/lib/routes';
import { Link } from '@inertiajs/react';
import { Activity, ArrowRight, Baby, Check, Share2, Users } from 'lucide-react';
import { useState } from 'react';

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

interface HomeProps {
    announcements: Announcement[];
    maintenance?: string | null;
}

// get color class based on category
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

export default function Home({ announcements = [], maintenance = null }: HomeProps) {
    const [sharedId, setSharedId] = useState<number | null>(null);

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
                .glass-card {
                    background: color-mix(in srgb, var(--bg-light) 70%, transparent);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid color-mix(in srgb, var(--border) 30%, transparent);
                }
            `}</style>

            {/* Maintenance Message Banner */}
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
            {/* Hero Section */}
            <section className="animate-fade-in-up relative overflow-hidden bg-gradient-to-br from-[var(--bg-light)] to-[var(--bg)] pt-24 pb-20 md:pt-32 md:pb-24">
                <div className="absolute top-0 right-0 -z-10 h-full w-1/2 opacity-20 md:opacity-30">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path
                            fill="var(--primary)"
                            d="M39.9,-68.5C51.1,-62.8,59.5,-51.2,65.7,-38.7C71.9,-26.3,75.8,-13.2,76.7,0.5C77.6,14.2,75.4,28.3,69.2,41C63,53.7,52.8,64.9,40.2,70.2C27.5,75.6,13.8,75,0.5,74.1C-12.8,73.2,-25.5,72.1,-37.7,67.4C-49.9,62.8,-61.6,54.6,-69.2,43.2C-76.9,31.8,-80.5,15.9,-79.7,0.5C-78.9,-14.9,-73.7,-29.8,-65.2,-42.2C-56.7,-54.7,-44.8,-64.6,-32,-69.2C-19.2,-73.8,-5.4,-73.1,7.4,-70.7C20.2,-68.3,28.6,-74.3,39.9,-68.5Z"
                            transform="translate(100 100)"
                        />
                    </svg>
                </div>

                <div className="container mx-auto px-6 text-center lg:px-8">
                    <h1 className="mb-6 text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
                        <div className="flex items-center justify-center gap-4">
                            <img src="/NutriBantay Logo.svg" alt="NutriBantay" width="64" height="64" className="h-10 w-auto md:h-14 lg:h-16" />
                            <span className="gradient-text">NutriBantay</span>
                        </div>
                    </h1>
                    <p className="mx-auto mb-10 max-w-2xl text-lg text-[var(--text-muted)] md:text-xl">
                        Empowering our community with nutrition monitoring and health services for a healthier future
                    </p>
                    <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
                        <a
                            href="#announcements"
                            className="group flex w-48 items-center justify-center rounded-full border-2 border-[var(--primary)] px-6 py-3 font-medium text-[var(--primary)] transition-all hover:bg-[var(--primary)] hover:text-white hover:shadow-lg"
                        >
                            <span>Latest Updates</span>
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </a>
                    </div>

                    {/* Floating Health Stats Cards */}
                    <div className="relative mx-auto mt-16 max-w-5xl">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="card-hover glass-card rounded-2xl p-6 shadow-md">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10">
                                    <Baby className="h-6 w-6 text-[var(--primary)]" />
                                </div>
                                <h3 className="text-3xl font-bold text-[var(--primary)]">500+</h3>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">Children Monitored</p>
                            </div>
                            <div className="card-hover glass-card rounded-2xl p-6 shadow-md">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10">
                                    <Activity className="h-6 w-6 text-[var(--primary)]" />
                                </div>
                                <h3 className="text-3xl font-bold text-[var(--primary)]">50+</h3>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">Health Programs</p>
                            </div>
                            <div className="card-hover glass-card rounded-2xl p-6 shadow-md">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10">
                                    <Users className="h-6 w-6 text-[var(--primary)]" />
                                </div>
                                <h3 className="text-3xl font-bold text-[var(--primary)]">200+</h3>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">Families Assisted</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Announcements Preview Section */}
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
                                <div
                                    key={announcement.id}
                                    className="card-hover group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white/80 shadow-sm backdrop-blur-sm dark:bg-[var(--bg-light)]/80"
                                >
                                    <div className="absolute inset-0 bg-[var(--bg-light)] dark:bg-[var(--bg)]"></div>
                                    <div className="absolute top-0 right-0 left-0 z-10 p-6">
                                        <span
                                            className={`inline-block rounded-full ${getCategoryColorClass(announcement.category.color)} px-3 py-1 text-xs font-medium text-white`}
                                        >
                                            {announcement.category.name}
                                        </span>
                                    </div>
                                    <div className="relative z-20 flex h-full flex-col p-6 pt-16">
                                        <h3 className="mb-3 text-xl font-semibold group-hover:text-[var(--info)]">{announcement.title}</h3>
                                        <p
                                            className="mb-4 flex-1 text-[var(--text-muted)]"
                                            style={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {announcement.summary}
                                        </p>
                                        <div className="relative z-30 mt-auto flex items-center justify-between gap-2 pt-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-[var(--text-muted)]">{announcement.date}</span>
                                                <button
                                                    onClick={() => shareAnnouncement(announcement)}
                                                    className="flex cursor-pointer items-center gap-1 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]"
                                                >
                                                    {sharedId === announcement.id ? (
                                                        <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                                                    ) : (
                                                        <Share2 className="h-4 w-4" />
                                                    )}
                                                    <span className={sharedId === announcement.id ? 'text-green-500 dark:text-green-400' : ''}>
                                                        {sharedId === announcement.id ? 'Copied!' : 'Share'}
                                                    </span>
                                                </button>
                                            </div>
                                            <Link href={route('guest.announcements.show', { announcement: announcement.slug })}>
                                                <Button
                                                    className="rounded-full border border-[var(--border-muted)] bg-[var(--bg-light)] px-4 py-2 text-sm font-medium text-[var(--primary)] transition-colors hover:border-[var(--bg-light)] hover:bg-[var(--primary)] hover:text-white"
                                                    size="sm"
                                                >
                                                    Read More
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center">
                                <p className="text-lg text-[var(--text-muted)]">No announcements available at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="animate-fade-in-up relative overflow-hidden bg-gradient-to-br from-[var(--primary)] to-teal-900 py-16 dark:to-gray-900">
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-teal-600 opacity-20 dark:bg-teal-400 dark:opacity-30" />
                <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-600 opacity-20 dark:bg-cyan-400 dark:opacity-30" />
                <div className="relative container mx-auto px-6 text-center lg:px-8">
                    <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Making a Difference in Our Community</h2>
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
                        Be part of our mission to improve nutrition and health outcomes for children in our community. Register today to access our
                        services.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
                        <Link
                            href={route('guest.contact')}
                            className="inline-flex items-center rounded-full border-2 border-white/60 px-8 py-3 font-medium text-white transition-all hover:border-white hover:bg-white/10"
                        >
                            Contact Us
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
