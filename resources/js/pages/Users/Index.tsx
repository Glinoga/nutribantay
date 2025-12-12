import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

type User = {
    id: number;
    name: string;
    email: string;
    roles: string[];
};

type RegistrationCode = {
    code: string;
    expires_at: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: '/users',
    },
];

interface Props {
    users: User[];
    filters: { search?: string };
}

export default function Index({ users, filters }: Props) {
    const [codes, setCodes] = useState<RegistrationCode[]>([]);
    const [count, setCount] = useState(1);
    const [search, setSearch] = useState(filters.search || '');
    const [loading, setLoading] = useState(false);

    // Maintenance mode state
    const [maintenance, setMaintenance] = useState(false);

    useEffect(() => {
        // Fetch current maintenance mode on load
        axios
            .get('/maintenance/status')
            .then((res) => setMaintenance(res.data.status))
            .catch((err) => console.error('Failed to fetch maintenance status', err));
    }, []);

    const toggleMaintenance = async () => {
        try {
            const newStatus = !maintenance;
            const res = await axios.post('/maintenance/toggle', { status: newStatus });
            setMaintenance(res.data.status);

            // Show appropriate alert
            if (res.data.status) {
                alert(
                    '✅ Maintenance mode ENABLED\n\n' +
                        '• All Healthworker users will be logged out on their next request\n' +
                        '• They will be redirected to the home page\n' +
                        '• Only Admin users can access the system',
                );
            } else {
                alert('✅ Maintenance mode DISABLED\n\nAll users can now access the system normally.');
            }

            // Optionally reload the page to ensure UI is in sync
            // window.location.reload();
        } catch (err) {
            console.error(err);
            alert('❌ Failed to update maintenance mode. Please try again.');
        }
    };

    const generateAdminCodes = async () => {
        try {
            setLoading(true);
            const response = await axios.post('/registration-codes/generate', { count });
            setCodes(response.data.codes);
            alert(`Successfully generated ${response.data.codes.length} code(s)!`);
        } catch (error) {
            console.error(error);
            alert('Failed to generate admin codes.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/users', { search }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            {/* Header */}
            <div className="m-4 mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">User List</h1>
                <div className="flex space-x-2">
                    <Link href="/users/create" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        Create Account
                    </Link>
                    <Link href="/users/archived" className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-800">
                        View Archived Users
                    </Link>
                </div>
            </div>

            {/* Maintenance Toggle */}
            <div className="m-4">
                <button onClick={toggleMaintenance} className={`rounded px-4 py-2 ${maintenance ? 'bg-red-600' : 'bg-green-600'} text-white`}>
                    {maintenance ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
                </button>
            </div>

            {/* Search Bar */}
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

            {/* Admin Codes Section */}
            <div className="m-4 mb-6 rounded border p-4">
                <h2 className="mb-2 text-lg font-semibold">Admin Codes</h2>
                <div className="mb-3 flex items-center space-x-2">
                    <label htmlFor="count" className="text-gray-700">
                        Number of Codes:
                    </label>
                    <input
                        id="count"
                        type="number"
                        min="1"
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        className="w-20 rounded border px-2 py-1"
                    />
                    <button
                        onClick={generateAdminCodes}
                        disabled={loading}
                        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate'}
                    </button>
                </div>

                {codes.length > 0 ? (
                    <div className="mt-3">
                        <ul className="list-inside list-disc space-y-1">
                            {codes.map((code, index) => (
                                <li key={index} className="font-mono text-blue-600">
                                    {code.code}{' '}
                                    {code.expires_at && (
                                        <span className="text-sm text-gray-600">(expires {new Date(code.expires_at).toLocaleString()})</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="mt-3 text-gray-500">No codes generated yet.</div>
                )}
            </div>

            {/* Users Table */}
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
