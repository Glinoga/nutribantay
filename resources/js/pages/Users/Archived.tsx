import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    deleted_at: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Archived Users',
        href: '/users/archived',
    },
];

interface Props {
    users: User[];
}

export default function Archived({ users }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archived Users" />
            <div className="m-4 mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">Archived User Accounts</h1>
                <Link href="/users" className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
                    Back
                </Link>
            </div>

            <table className="min-w-full overflow-hidden rounded border">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="border px-4 py-2 text-left">ID</th>
                        <th className="border px-4 py-2 text-left">Name</th>
                        <th className="border px-4 py-2 text-left">Email</th>
                        <th className="border px-4 py-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-100">
                            <td className="border px-4 py-2">{user.id}</td>
                            <td className="border px-4 py-2">{user.name}</td>
                            <td className="border px-4 py-2">{user.email}</td>
                            <td className="border px-4 py-2">
                                <button
                                    onClick={() => router.post(`/users/${user.id}/restore`)}
                                    className="mr-2 rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                                >
                                    Restore
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Permanently delete this user?')) {
                                            router.delete(`/users/${user.id}/force-delete`);
                                        }
                                    }}
                                    className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                                >
                                    Delete Permanently
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </AppLayout>
    );
}
