import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

type Announcement = {
    id: number;
    title: string;
    content: string;
    created_at: string;
};

type Props = {
    announcements: Announcement[];
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Announcements', href: '/dashboard/announcements' }];

export default function AdminAnnouncements({ announcements: initialAnnouncements }: Props) {
    const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);

    const {
        data,
        setData,
        post,
        delete: destroy,
        reset,
    } = useForm({
        title: '',
        content: '',
    });

    // 🔹 Add new announcement
    const addAnnouncement = () => {
        post('/announcements', {
            onSuccess: (page) => {
                // Get the latest announcements from props returned by Inertia
                const latest = page.props.announcements as Announcement[];
                setAnnouncements(latest);
                reset(); // clear form
            },
            onError: (errors) => console.error(errors),
        });
    };

    // 🔹 Delete announcement
    const deleteAnnouncement = (id: number) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;

        destroy(`/announcements/${id}`, {
            onSuccess: (page) => {
                const latest = page.props.announcements as Announcement[];
                setAnnouncements(latest);
            },
            onError: (errors) => console.error(errors),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Announcements" />

            {/* 🔹 Add Announcement Form */}
            <div className="m-4 rounded border p-4">
                <h2 className="mb-2 text-lg font-semibold">Add Announcement</h2>
                <input
                    type="text"
                    placeholder="Title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    className="mb-2 w-full rounded border px-3 py-2"
                />
                <textarea
                    placeholder="Content"
                    value={data.content}
                    onChange={(e) => setData('content', e.target.value)}
                    className="mb-2 w-full rounded border px-3 py-2"
                />
                <button onClick={addAnnouncement} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Add Announcement
                </button>
            </div>

            {/* 🔹 Announcements Table */}
            <table className="min-w-full overflow-hidden rounded border">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="border px-4 py-2 text-left">ID</th>
                        <th className="border px-4 py-2 text-left">Title</th>
                        <th className="border px-4 py-2 text-left">Content</th>
                        <th className="border px-4 py-2 text-left">Created At</th>
                        <th className="border px-4 py-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {announcements.map((a) => (
                        <tr key={a.id} className="hover:bg-gray-100">
                            <td className="border px-4 py-2">{a.id}</td>
                            <td className="border px-4 py-2">{a.title}</td>
                            <td className="border px-4 py-2">{a.content}</td>
                            <td className="border px-4 py-2">{new Date(a.created_at).toLocaleString()}</td>
                            <td className="border px-4 py-2">
                                <button onClick={() => deleteAnnouncement(a.id)} className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    {announcements.length === 0 && (
                        <tr>
                            <td colSpan={5} className="border px-4 py-2 text-center text-gray-500">
                                No announcements found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </AppLayout>
    );
}
