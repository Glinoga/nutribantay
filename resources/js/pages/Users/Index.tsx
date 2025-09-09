import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';

type User = {
    id: number;
    name: string;
    email: string;
    roles: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: '/users',
    },
];

interface Props {
    users: User[];
    filters: { search?: string }; // 👈 added to persist search term
}

export default function Index({ users, filters }: Props) {
    const { delete: destroy } = useForm({});
    const [adminCode, setAdminCode] = useState<string | null>(null);
    const [search, setSearch] = useState(filters.search || ''); // 👈 keep track of search input

    const generateAdminCode = async () => {
        try {
            const response = await axios.post('/registration-codes/generate');
            setAdminCode(response.data.code);
            alert('New Admin Code generated!');
        } catch (error) {
            console.error(error);
            alert('Failed to generate admin code.');
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/users', { search }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="m-4 mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">User List</h1>
                <Link href="/users/archived" className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-800">
                    View Archived Users
                </Link>
            </div>

            {/* 🔹 Search Bar */}
            <form onSubmit={handleSearch} className="m-4 flex items-center space-x-2">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by ID, Name, Email, or Role"
                    className="w-64 rounded border px-3 py-2"
                />
                <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Search
                </button>
            </form>

            {/* 🔹 Admin Code Section */}
            <div className="m-4 mb-6 rounded border p-4">
                <h2 className="mb-2 text-lg font-semibold">Admin Code</h2>
                <button onClick={generateAdminCode} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Generate Admin Code
                </button>

                {adminCode && (
                    <div className="mt-3 rounded bg-gray-100 p-2 font-mono">
                        Current Code: <span className="font-bold">{adminCode}</span>
                    </div>
                )}
            </div>

            {/* 🔹 Users Table */}
            <table className="min-w-full overflow-hidden rounded border">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="border px-4 py-2 text-left">ID</th>
                        <th className="border px-4 py-2 text-left">Name</th>
                        <th className="border px-4 py-2 text-left">Email</th>
                        <th className="border px-4 py-2 text-left">Role</th>
                        <th className="border px-4 py-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-100">
                            <td className="border px-4 py-2">{user.id}</td>
                            <td className="border px-4 py-2">{user.name}</td>
                            <td className="border px-4 py-2">{user.email}</td>
                            <td className="border px-4 py-2">{user.roles.length > 0 ? user.roles.join(', ') : 'No Role'}</td>
                            <td className="border px-4 py-2">
                                <Link
                                    href={`/users/${user.id}`}
                                    className="mr-2 rounded bg-gray-500 px-3 py-1 text-white transition hover:bg-gray-600"
                                >
                                    View
                                </Link>
                                <Link
                                    href={`/users/${user.id}/edit`}
                                    className="mr-2 rounded bg-green-500 px-3 py-1 text-white transition hover:bg-green-600"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => {
                                        if (confirm('Archive this user?')) {
                                            router.delete(`/users/${user.id}`);
                                        }
                                    }}
                                    className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                                >
                                    Archive
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </AppLayout>
    );
}
