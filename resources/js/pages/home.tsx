import { Button } from '@/components/ui/button';
import GuestLayout from '@/layouts/guest-layout';
import { route } from '@/lib/routes';
import { Link } from '@inertiajs/react';

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

interface HomeProps {
    announcements: Announcement[];
}

// get color class based on category
function getCategoryColorClass(categoryColor: string) {
    const colorMap: Record<string, string> = {
        'primary': 'bg-[var(--primary)]',
        'secondary': 'bg-[var(--secondary)]',
        'success': 'bg-[var(--success)]',
        'info': 'bg-[var(--info)]',
        'warning': 'bg-[var(--warning)]',
        'danger': 'bg-[var(--danger)]',
    };
    return colorMap[categoryColor] || 'bg-[var(--primary)]';
}

export default function Home({ announcements = [] }: HomeProps) {
    return (
        <GuestLayout title="Home">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[var(--bg-light)] to-[var(--bg)] pt-24 pb-20 md:pt-32 md:pb-24">
                <div className="absolute top-0 right-0 -z-10 h-full w-1/2 opacity-20 md:opacity-30">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="var(--primary)" d="M39.9,-68.5C51.1,-62.8,59.5,-51.2,65.7,-38.7C71.9,-26.3,75.8,-13.2,76.7,0.5C77.6,14.2,75.4,28.3,69.2,41C63,53.7,52.8,64.9,40.2,70.2C27.5,75.6,13.8,75,0.5,74.1C-12.8,73.2,-25.5,72.1,-37.7,67.4C-49.9,62.8,-61.6,54.6,-69.2,43.2C-76.9,31.8,-80.5,15.9,-79.7,0.5C-78.9,-14.9,-73.7,-29.8,-65.2,-42.2C-56.7,-54.7,-44.8,-64.6,-32,-69.2C-19.2,-73.8,-5.4,-73.1,7.4,-70.7C20.2,-68.3,28.6,-74.3,39.9,-68.5Z" transform="translate(100 100)" />
                    </svg>
                </div>
                
                <div className="container mx-auto px-6 text-center lg:px-8">
                    <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                        <span className="gradient-text">Welcome to NutriBantay</span>
                    </h1>
                    <p className="mx-auto mb-10 max-w-2xl text-lg text-[var(--text-muted)] md:text-xl">
                        Empowering our community with nutrition monitoring and health services for a healthier future
                    </p>
                    <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
                        <a 
                            href="#services" 
                            className="group flex w-48 items-center justify-center rounded-full bg-[var(--primary)] px-6 py-3 font-medium text-white transition-all hover:bg-opacity-90 hover:shadow-lg"
                        >
                            <span>Our Services</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </a>
                        <a 
                            href="#announcements" 
                            className="group flex w-48 items-center justify-center rounded-full border-2 border-[var(--primary)] px-6 py-3 font-medium text-[var(--primary)] transition-all hover:bg-[var(--primary)] hover:text-white hover:shadow-lg"
                        >
                            <span>Latest Updates</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </a>
                    </div>
                    
                    {/* Floating Health Stats Cards */}
                    <div className="relative mx-auto mt-16 max-w-5xl">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                            <div className="card-hover rounded-2xl bg-white p-6 shadow-md">
                                <h3 className="text-3xl font-bold text-[var(--primary)]">500+</h3>
                                <p className="text-sm text-[var(--text-muted)]">Children Monitored</p>
                            </div>
                            <div className="card-hover rounded-2xl bg-white p-6 shadow-md">
                                <h3 className="text-3xl font-bold text-[var(--primary)]">50+</h3>
                                <p className="text-sm text-[var(--text-muted)]">Health Programs</p>
                            </div>
                            <div className="card-hover rounded-2xl bg-white p-6 shadow-md">
                                <h3 className="text-3xl font-bold text-[var(--primary)]">200+</h3>
                                <p className="text-sm text-[var(--text-muted)]">Families Assisted</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-20 bg-white dark:bg-[var(--bg)]">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <span className="mb-2 inline-block rounded-full bg-[var(--bg-light)] px-4 py-1 text-sm font-medium text-[var(--primary)]">OUR OFFERINGS</span>
                        <h2 className="mb-4 text-3xl font-bold text-[var(--text)] md:text-4xl">
                            Our Services
                        </h2>
                        <div className="mx-auto h-1 w-24 rounded-full bg-[var(--primary)]"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {/* Service 1 */}
                        <div className="card-hover rounded-2xl bg-[var(--bg-light)] p-8 shadow-sm inset-shadow-sm transition-all">
                            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[var(--border)] text-[var(--text)]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="mb-4 text-xl font-semibold text-[var(--text)]">
                                Nutrition Monitoring
                            </h3>
                            <p className="mb-4 text-[var(--text-muted)]">
                                Regular assessment of children's growth, nutrition status, and health indicators to ensure optimal development.
                            </p>
                            <a href="#" className="inline-flex items-center text-[var(--primary)] hover:underline">
                                <span>Learn more</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </a>
                        </div>

                        {/* Service 2 */}
                        <div className="card-hover rounded-2xl bg-[var(--bg-light)] p-8 shadow-sm transition-all">
                            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[var(--border)] text-[var(--text)]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <h3 className="mb-4 text-xl font-semibold text-[var(--text)]">
                                Health Education
                            </h3>
                            <p className="mb-4 text-[var(--text-muted)]">
                                Educational programs for parents and children about proper nutrition, healthy eating habits, and preventive healthcare.
                            </p>
                            <a href="#" className="inline-flex items-center text-[var(--secondary)] hover:underline">
                                <span>Learn more</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </a>
                        </div>

                        {/* Service 3 */}
                        <div className="card-hover rounded-2xl bg-[var(--bg-light)] p-8 shadow-sm transition-all">
                            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[var(--border)] text-[var(--text)]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <h3 className="mb-4 text-xl font-semibold text-[var(--text)]">
                                Community Programs
                            </h3>
                            <p className="mb-4 text-[var(--text-muted)]">
                                Initiatives to strengthen community health resources and promote wellness among all residents.
                            </p>
                            <a href="#" className="inline-flex items-center text-[var(--success)] hover:underline">
                                <span>Learn more</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Announcements Preview Section */}
            <section id="announcements" className="py-20">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div>
                            <span className="mb-2 inline-block rounded-full bg-[var(--bg-light)] px-4 py-1 text-sm font-medium text-[var(--primary)]">STAY UPDATED</span>
                            <h2 className="text-3xl font-bold text-[var(--text)] md:text-4xl">
                                Latest Announcements
                            </h2>
                        </div>
                        <a 
                            href={route('guest.announcements')}
                            className="inline-flex items-center rounded-full border-2 border-[var(--primary)] px-6 py-2 text-[var(--primary)] transition-all hover:bg-[var(--primary)] hover:text-white"
                        >
                            <span>View All</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </a>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {announcements.length > 0 ? announcements.map(announcement => (
                        <div key={announcement.id} className="card-hover group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm h-full">
                            <div className="absolute inset-0 bg-[(--bg-light)]"></div>
                            <div className="absolute top-0 left-0 right-0 p-6 z-10">
                                <span className={`inline-block rounded-full ${getCategoryColorClass(announcement.category.color)} px-3 py-1 text-xs font-medium text-white`}>
                                    {announcement.category.name}
                                </span>
                            </div>
                            <div className="flex flex-col p-6 pt-16 h-full relative z-20">
                                <h3 className="mb-3 text-xl font-semibold group-hover:text-[var(--info)]">
                                    {announcement.title}
                                </h3>
                                <p className="mb-4 text-[var(--text-muted)] flex-grow">
                                    {announcement.summary}
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-4 relative z-30">
                                    <span className="text-sm text-[var(--text-muted)]">{announcement.date}</span>
                                        <Link href={route('guest.announcements.show', { announcement: announcement.id })}>
                                            <Button className='rounded-full border border-[var(--border-muted)] bg-[var(--bg-light)] px-4 py-2 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)] hover:text-white hover:border-[var(--bg-light)]' size="sm">Read More</Button>
                                        </Link>
                                </div>
                            </div>
                        </div>
                        )) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-lg text-[var(--text-muted)]">
                                    No announcements available at the moment.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-12 bg-[var(--primary)]">
                <div className="container mx-auto px-6 text-center lg:px-8">
                    <h2 className="mb-8 text-3xl font-bold text-white md:text-4xl">
                        Making a Difference in Our Community
                    </h2>
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-white text-opacity-80">
                        Be part of our mission to improve nutrition and health outcomes for children in our community. Register today to access our services.
                    </p>
                </div>
            </section>
        </GuestLayout>
    );
}