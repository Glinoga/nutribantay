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
    status?: 'pending' | 'approved' | 'rejected';
};

type RegistrationCode = {
    id: number;
    code: string;
    barangay: number;
    expires_at: string | null;
    is_used: boolean;
    status: 'active' | 'used' | 'expired';
    created_at: string;
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

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [codeSearch, setCodeSearch] = useState('');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Maintenance mode state
    const [maintenance, setMaintenance] = useState(false);

    useEffect(() => {
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

            // If modal is open, refresh the list
            if (showModal) {
                const modalResponse = await axios.get('/registration-codes');
                setCodes(modalResponse.data.codes);
            }

            alert(`Successfully generated ${response.data.codes.length} code(s)!`);
        } catch (error) {
            console.error(error);
            alert('Failed to generate admin codes.');
        } finally {
            setLoading(false);
        }
    };

    const openCodeModal = async () => {
        setShowModal(true);
        setModalLoading(true);
        try {
            const response = await axios.get('/registration-codes');
            console.log('Response:', response.data);
            setCodes(response.data.codes || response.data);
        } catch (error: any) {
            console.error('Failed to fetch codes:', error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
            alert('Failed to load codes: ' + errorMessage);
        } finally {
            setModalLoading(false);
        }
    };

    const copyToClipboard = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const copyAllCodes = async () => {
        const codeList = filteredCodes.map((c) => c.code).join('\n');
        try {
            await navigator.clipboard.writeText(codeList);
            alert('All codes copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const deleteCode = async (id: number) => {
        if (!confirm('Are you sure you want to delete this code?')) return;

        try {
            await axios.delete(`/registration-codes/${id}`);
            setCodes(codes.filter((c) => c.id !== id));
            alert('Code deleted successfully.');
        } catch (error) {
            console.error('Failed to delete code:', error);
            alert('Failed to delete code.');
        }
    };

    const filteredCodes = codes.filter((c) => c.code.toLowerCase().includes(codeSearch.toLowerCase()));

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'used':
                return 'bg-gray-100 text-gray-800';
            case 'expired':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
                    <button onClick={openCodeModal} className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">
                        View All Codes
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <table className="min-w-full overflow-hidden rounded border">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="border px-4 py-2 text-left">ID</th>
                        <th className="border px-4 py-2 text-left">Name</th>
                        <th className="border px-4 py-2 text-left">Email</th>
                        <th className="border px-4 py-2 text-left">Role</th>
                        <th className="border px-4 py-2 text-left">Status</th>
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
                                {user.status === 'pending' && (
                                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">Pending</span>
                                )}
                                {user.status === 'approved' && (
                                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Approved</span>
                                )}
                                {user.status === 'rejected' && (
                                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">Rejected</span>
                                )}
                                {!user.status && <span className="text-gray-500">-</span>}
                            </td>
                            <td className="border px-4 py-2">
                                {user.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                if (confirm('Approve this user?')) {
                                                    router.post(`/users/${user.id}/approve`);
                                                }
                                            }}
                                            className="mr-1 rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Reject this user?')) {
                                                    router.post(`/users/${user.id}/reject`);
                                                }
                                            }}
                                            className="mr-1 rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                <Link
                                    href={`/users/${user.id}`}
                                    className="mr-1 rounded bg-gray-500 px-2 py-1 text-xs text-white transition hover:bg-gray-600"
                                >
                                    View
                                </Link>
                                <Link
                                    href={`/users/${user.id}/edit`}
                                    className="mr-1 rounded bg-green-500 px-2 py-1 text-xs text-white transition hover:bg-green-600"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => {
                                        if (confirm('Archive this user?')) {
                                            router.delete(`/users/${user.id}`);
                                        }
                                    }}
                                    className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                >
                                    Archive
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Codes Modal */}
            {showModal && (
                <>
                    {/* Backdrop with blur */}
                    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="max-h-[80vh] w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold">Registration Codes</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                    ✕ Close
                                </button>
                            </div>

                            {/* Search and Actions */}
                            <div className="mb-4 flex items-center justify-between">
                                <input
                                    type="text"
                                    value={codeSearch}
                                    onChange={(e) => setCodeSearch(e.target.value)}
                                    placeholder="Search codes..."
                                    className="w-64 rounded border px-3 py-2"
                                />
                                <button onClick={copyAllCodes} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                                    Copy All
                                </button>
                            </div>

                            {/* Codes Table */}
                            {modalLoading ? (
                                <div className="py-8 text-center">Loading...</div>
                            ) : (
                                <div className="max-h-96 overflow-y-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="sticky top-0 bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Barangay</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredCodes.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                                        No codes found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredCodes.map((code) => (
                                                    <tr key={code.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 font-mono text-sm">{code.code}</td>
                                                        <td className="px-4 py-2">{code.barangay}</td>
                                                        <td className="px-4 py-2 text-sm">
                                                            {code.expires_at ? new Date(code.expires_at).toLocaleString() : 'No expiry'}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <button
                                                                onClick={() => copyToClipboard(code.code)}
                                                                className="mr-2 rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                                                            >
                                                                {copiedCode === code.code ? 'Copied!' : 'Copy'}
                                                            </button>
                                                            {code.status !== 'active' && (
                                                                <button
                                                                    onClick={() => deleteCode(code.id)}
                                                                    className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                                                >
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="mt-4 text-sm text-gray-500">Total: {filteredCodes.length} code(s)</div>
                        </div>
                    </div>
                </>
            )}
        </AppLayout>
    );
}
