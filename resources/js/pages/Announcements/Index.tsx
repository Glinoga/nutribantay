import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Announcements', href: '/admin/announcements' },
];

// Define types for Category
interface Category {
    id: number;
    name: string;
    slug: string;
    color: string;
    description?: string;
}

// Define types for our announcement
interface Announcement {
    id: number;
    title: string;
    category_id: number;
    category: Category;
    date: string;
    end_date?: string;
    author?: string;
    summary: string;
    content: string;
    image?: string;
    created_at: string;
    updated_at: string;
}

export default function Index({ announcements }: { announcements: Announcement[] }) {
    const form = useForm();

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this announcement?")) {
            form.delete(`/admin/announcements/${id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Announcements" />
            <div className="m-4">
                {/* Create */}
                <Link href="/admin/announcements/create">
                    <Button>+ New Announcement</Button>
                </Link>

                <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {announcements.map((a) => (
                        <div 
                            key={a.id} 
                            className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-xl dark:bg-[var(--bg-light)]"
                        >
                            <div className="absolute inset-x-0 top-0 h-2" style={{
                                backgroundColor: `var(--${a.category.color || 'primary'})`
                            }}></div>

                            <div className=""> 
                                {a.image ? (
                                    <img
                                        src={`/storage/${a.image}`}
                                        alt="Announcement"
                                        className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-48 w-full items-center justify-center bg-[var(--border)] text-[var(--text-muted)]">
                                        <Megaphone size={48} />
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-6 pt-8">
                                {/* Category Badge */}
                                <Badge className="mb-3" style={{
                                    backgroundColor: `var(--${a.category.color || 'primary'})`,
                                    color: 'white'
                                }}>
                                    {a.category.name}
                                </Badge>
                                
                                <h3 className="mb-2 text-xl font-semibold text-[var(--text)] group-hover:text-[var(--primary)]">
                                    {a.title}
                                </h3>
                                
                                <div className="flex gap-2 mb-3 text-sm text-[var(--text-muted)]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 inline-block h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {a.date}
                                    
                                    {a.author && (
                                        <span className="ml-2">
                                            by {a.author}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="mb-4 h-0.5 w-16 rounded-full bg-[var(--border-muted)]"></div>
                                
                                <p className="mb-6 text-[var(--text)] line-clamp-4">
                                    {a.summary}
                                </p>
                                
                                <div className="flex items-end justify-end gap-2">
                                    <Link href={`/admin/announcements/${a.id}/edit`}>
                                        <Button className='px-8 bg-[var(--blue)] text-white border-[var(--info)] hover:text-[var(--card)] hover:bg-[var(--blue)]/90 focus-visible:ring-[var(--info)]/20 dark:focus-visible:ring-[var(--blue)]/40' size="sm">Edit</Button>
                                    </Link>

                                    <Button className='px-8 bg-[var(--red)] text-white border-[var(--info)] hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40' size="sm" onClick={() => handleDelete(a.id)}>Delete</Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {announcements.length === 0 && (
                    <p className="mt-6 text-gray-500">No announcements available.</p>
                )}
            </div>
        </AppLayout>
    );
}
