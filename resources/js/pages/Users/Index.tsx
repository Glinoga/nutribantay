import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: '/users',
    },
];

interface Props {
    users: User[];
}

export default function Index({ users }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="m-4 mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">User List</h1>
                <Link href="/users/create" className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
                    + Create User
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
                                <Link
                                    href={`/users/${user.id}/edit`}
                                    className="mr-2 rounded bg-green-500 px-3 py-1 text-white transition hover:bg-green-600"
                                >
                                    Edit
                                </Link>
                                <Link
                                    href={`/users/${user.id}/delete`}
                                    className="rounded bg-red-500 px-3 py-1 text-white transition hover:bg-red-600"
                                    method="delete"
                                    as="button"
                                >
                                    Delete
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </AppLayout>
    );
}
