import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Announcements', href: '/admin/announcements' },
];

export default function Index({ announcements }: { announcements: any[] }) {
    const form = useForm();

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this announcement?")) {
            form.delete(`/announcements/${id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Announcements" />
            <div className="m-4">
                {/* Create */}
                <Link href="/announcements/create">
                    <Button>+ New Announcement</Button>
                </Link>

                <div className="mt-6 space-y-4">
                    {announcements.length === 0 && (
                        <p className="text-gray-500">No announcements available.</p>
                    )}

                    {announcements.map((a) => (
                        <div key={a.id} className="p-4 border rounded-lg">
                            <h2 className="text-lg font-bold">{a.title}</h2>
                            <p className="text-gray-700">{a.summary}</p>

                            {a.image && (
                                <img
                                    src={`/storage/${a.image}`}
                                    alt="Announcement"
                                    className="mt-2 w-40 rounded"
                                />
                            )}

                            <div className="mt-3 space-x-4">
                                {/* Edit */}
                                <Link
                                    href={`/announcements/${a.id}/edit`}
                                    className="text-blue-600 hover:underline"
                                >
                                    Edit
                                </Link>

                                {/* Delete */}
                                <button
                                    onClick={() => handleDelete(a.id)}
                                    className="text-red-600 hover:underline"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
