import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import { smartToast } from '@/utils/smartToast';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { Archive, Clock, HardDrive, Key, Loader2, Plus, Search, Shield, ShieldAlert, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type User = {
    id: number;
    name: string;
    email: string;
    roles: string[];
    status?: 'pending' | 'approved' | 'rejected';
    registration_code?: string;
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
        href: route('users.index'),
    },
];

interface Props {
    users: User[];
    filters: { search?: string };
    isSeededAdmin?: boolean;
}

export default function Index({ users, filters, isSeededAdmin = false }: Props) {
    const [codes, setCodes] = useState<RegistrationCode[]>([]);
    const [count, setCount] = useState(1);
    const [search, setSearch] = useState(filters.search || '');
    const [loading, setLoading] = useState(false);

    const [showCodeModal, setShowCodeModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [codeSearch, setCodeSearch] = useState('');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Healthworker' });
    const [createError, setCreateError] = useState('');
    const [createSuccess, setCreateSuccess] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [copiedLogin, setCopiedLogin] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    const [maintenance, setMaintenance] = useState(false);

    const [approveUserId, setApproveUserId] = useState<number | null>(null);
    const [rejectUserId, setRejectUserId] = useState<number | null>(null);
    const [archiveUserId, setArchiveUserId] = useState<number | null>(null);
    const [deleteCodeId, setDeleteCodeId] = useState<number | null>(null);
    const [maintenanceConfirm, setMaintenanceConfirm] = useState(false);
    const [resetPasswordUserId, setResetPasswordUserId] = useState<number | null>(null);
    const [resetPasswordResult, setResetPasswordResult] = useState<string | null>(null);
    const [resetLoading, setResetLoading] = useState(false);
    const [copiedReset, setCopiedReset] = useState(false);

    const stats = useMemo(() => {
        const roles = new Set(users.flatMap((u) => u.roles));
        const pending = users.filter((u) => u.status === 'pending').length;
        return {
            total: users.length,
            roles: roles.size,
            pending,
        };
    }, [users]);

    const copyCredentials = async () => {
        const text = generatedCode ? `${generatedCode} - ${generatedPassword}` : generatedPassword;
        try {
            await navigator.clipboard.writeText(text);
            setCopiedLogin(true);
            setTimeout(() => setCopiedLogin(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const generatePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewUser({ ...newUser, password });
    };

    const handleCreateUser = async (closeAfter = false) => {
        if (!newUser.name || !newUser.password) {
            setCreateError('Please fill in name and password');
            return;
        }

        setCreateLoading(true);
        setCreateError('');

        try {
            const res = await axios.post(route('users.storeBulk'), {
                name: newUser.name,
                email: newUser.email || null,
                password: newUser.password,
                role: newUser.role,
            });

            setGeneratedCode(res.data.code || '');
            setGeneratedPassword(res.data.password || '');
            setCreateSuccess('User created successfully!');
            setCreateLoading(false);

            if (closeAfter) {
                setShowCreateModal(false);
                setCreateSuccess('');
                setGeneratedCode('');
                setGeneratedPassword('');
            } else {
                setNewUser({ name: '', email: '', password: '', role: 'Healthworker' });
            }
            router.reload({ only: ['users'], preserveState: true, preserveScroll: true });
        } catch (err: unknown) {
            let message = 'Failed to create user';
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
                if (axiosErr.response?.data?.errors) {
                    const firstError = Object.values(axiosErr.response.data.errors).flat()[0];
                    if (firstError) message = firstError;
                } else if (axiosErr.response?.data?.message) {
                    message = axiosErr.response.data.message;
                }
            } else if (err instanceof Error) {
                message = err.message;
            }
            setCreateError(message);
            setCreateLoading(false);
        }
    };

    useEffect(() => {
        axios
            .get('/maintenance/status')
            .then((res) => setMaintenance(res.data.status))
            .catch((err) => console.error('Failed to fetch maintenance status', err));
    }, []);

    const toggleMaintenance = async () => {
        setMaintenanceConfirm(true);
    };

    const confirmMaintenanceToggle = async () => {
        try {
            const newStatus = !maintenance;
            const res = await axios.post('/maintenance/toggle', { status: newStatus });
            setMaintenance(res.data.status);
            setMaintenanceConfirm(false);

            if (res.data.status) {
                smartToast.success('Maintenance mode ENABLED - All Healthworker users will be logged out on their next request');
            } else {
                smartToast.success('Maintenance mode DISABLED - All users can now access the system normally');
            }
        } catch (err) {
            console.error(err);
            smartToast.error('Failed to update maintenance mode. Please try again.');
        }
    };

    const generateAdminCodes = async () => {
        try {
            setLoading(true);
            const response = await axios.post('/registration-codes/generate', { count });
            setCodes(response.data.codes);

            if (showCodeModal) {
                const modalResponse = await axios.get('/registration-codes');
                setCodes(modalResponse.data.codes || modalResponse.data);
            }

            smartToast.success(`Successfully generated ${response.data.codes.length} code(s)!`);
        } catch (error) {
            console.error(error);
            smartToast.error('Failed to generate admin codes.');
        } finally {
            setLoading(false);
        }
    };

    const openCodeModal = async () => {
        setShowCodeModal(true);
        setModalLoading(true);
        try {
            const response = await axios.get('/registration-codes');
            setCodes(response.data.codes || response.data);
        } catch (error: unknown) {
            console.error('Failed to fetch codes:', error);
            smartToast.error('Failed to load codes');
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
            smartToast.success('All codes copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const deleteCode = async (id: number) => {
        setDeleteCodeId(id);
    };

    const confirmDeleteCode = async () => {
        if (!deleteCodeId) return;
        try {
            await axios.delete(`/registration-codes/${deleteCodeId}`);
            setCodes(codes.filter((c) => c.id !== deleteCodeId));
            smartToast.success('Code deleted successfully.');
        } catch (error) {
            console.error('Failed to delete code:', error);
            smartToast.error('Failed to delete code.');
        } finally {
            setDeleteCodeId(null);
        }
    };

    const filteredCodes = codes.filter((c) => c.code.toLowerCase().includes(codeSearch.toLowerCase()));

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">
                        Active
                    </Badge>
                );
            case 'used':
                return <Badge variant="secondary">Used</Badge>;
            case 'expired':
                return <Badge variant="destructive">Expired</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('users.index'), { search }, { preserveState: true });
    };

    const handleApprove = async (userId: number) => {
        try {
            await router.post(route('users.approve', { id: userId }));
            smartToast.success('User approved successfully!');
        } catch (err) {
            smartToast.error('Failed to approve user.');
        } finally {
            setApproveUserId(null);
        }
    };

    const handleReject = async (userId: number) => {
        try {
            await router.post(route('users.reject', { id: userId }));
            smartToast.success('User rejected.');
        } catch (err) {
            smartToast.error('Failed to reject user.');
        } finally {
            setRejectUserId(null);
        }
    };

    const handleArchive = async (userId: number) => {
        try {
            await router.delete(route('users.destroy', { user: userId }));
            smartToast.success('User archived successfully.');
        } catch (err) {
            smartToast.error('Failed to archive user.');
        } finally {
            setArchiveUserId(null);
        }
    };

    const handleResetPassword = async (userId: number) => {
        setResetLoading(true);
        try {
            const res = await axios.post(route('users.reset-password', { id: userId }));
            setResetPasswordResult(res.data.password);
            smartToast.success('Password reset successfully!');
        } catch (err) {
            smartToast.error('Failed to reset password.');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="relative min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-cyan-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(13,148,136,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.12),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Pill Badge */}
                    <div className="mb-6 pt-8 text-center">
                        <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-teal-100/50 bg-white/90 px-6 py-3 shadow-lg backdrop-blur-sm dark:border-teal-800/50 dark:bg-gray-800/90">
                            <Users className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                            <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">User Management</span>
                        </div>
                    </div>

                    {/* Glassmorphic Header Card */}
                    <div className="relative mb-8 text-center">
                        <div className="relative mx-auto max-w-2xl rounded-3xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 opacity-50 blur-lg" />
                                    <div className="relative rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 p-4 shadow-lg">
                                        <HardDrive className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                                        User Management
                                    </h1>
                                    <p className="mt-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                                        <Users className="h-4 w-4" />
                                        Manage all registered users and registration codes
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="stat-card rounded-xl border border-teal-100/50 bg-white p-4 shadow-md transition-all hover:border-teal-200 hover:shadow-lg dark:bg-gray-800/80">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                                    <p className="mt-1 text-2xl font-bold text-teal-600 dark:text-teal-400">{stats.total}</p>
                                </div>
                                <div className="rounded-full bg-teal-50 p-2.5 dark:bg-teal-900/30">
                                    <Users className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                </div>
                            </div>
                        </div>
                        <div className="stat-card rounded-xl border border-cyan-100/50 bg-white p-4 shadow-md transition-all hover:border-cyan-200 hover:shadow-lg dark:bg-gray-800/80">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Roles</p>
                                    <p className="mt-1 text-2xl font-bold text-cyan-600 dark:text-cyan-400">{stats.roles}</p>
                                </div>
                                <div className="rounded-full bg-cyan-50 p-2.5 dark:bg-cyan-900/30">
                                    <Shield className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
                                </div>
                            </div>
                        </div>
                        <div className="stat-card rounded-xl border border-yellow-100/50 bg-white p-4 shadow-md transition-all hover:border-yellow-200 hover:shadow-lg dark:bg-gray-800/80">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Pending Approvals</p>
                                    <p className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
                                </div>
                                <div className="rounded-full bg-yellow-50 p-2.5 dark:bg-yellow-900/30">
                                    <Clock className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                                </div>
                            </div>
                        </div>
                        <div className="stat-card rounded-xl border border-teal-100/50 bg-white p-4 shadow-md transition-all hover:border-teal-200 hover:shadow-lg dark:bg-gray-800/80">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Admin Codes</p>
                                    <p className="mt-1 text-2xl font-bold text-teal-600 dark:text-teal-400">{codes.length}</p>
                                </div>
                                <div className="rounded-full bg-teal-50 p-2.5 dark:bg-teal-900/30">
                                    <Key className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Maintenance Toggle */}
                    <div className="mb-8">
                        <Button
                            onClick={toggleMaintenance}
                            variant={maintenance ? 'destructive' : 'default'}
                            className={maintenance ? '' : 'gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'}
                        >
                            <ShieldAlert className="h-4 w-4" />
                            {maintenance ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
                        </Button>
                    </div>

                    {/* Admin Codes Section */}
                    <Card className="mb-8 border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                        <CardHeader className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 py-4">
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                Admin Codes
                            </CardTitle>
                            <CardDescription>Generate and manage registration codes for admin users</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap items-center gap-3">
                                <Label htmlFor="count" className="whitespace-nowrap text-gray-700 dark:text-gray-300">
                                    Number of Codes:
                                </Label>
                                <Input
                                    id="count"
                                    type="number"
                                    min="1"
                                    value={count}
                                    onChange={(e) => setCount(Number(e.target.value.replace(/\D/g, '')))}
                                    className="w-20 border transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400"
                                />
                                <Button
                                    onClick={generateAdminCodes}
                                    disabled={loading}
                                    className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md transition-all duration-300 hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        'Generate'
                                    )}
                                </Button>
                                <Button onClick={openCodeModal} variant="outline">
                                    View All Codes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* User List Section */}
                    <Card className="mb-8 border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                        <CardHeader className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 py-4">
                            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                    User List
                                </CardTitle>
                                <CardDescription>Manage all registered users in the system</CardDescription>
                                <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                                    <Button
                                        onClick={() => {
                                            setCreateSuccess('');
                                            setCreateError('');
                                            setGeneratedCode('');
                                            setGeneratedPassword('');
                                            setNewUser({ name: '', email: '', password: '', role: 'Healthworker' });
                                            setShowCreateModal(true);
                                        }}
                                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md transition-all duration-300 hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg sm:w-auto"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create User
                                    </Button>
                                    <Button variant="outline" asChild className="w-full sm:w-auto">
                                        <Link href={route('users.archived')}>
                                            <Archive className="mr-2 h-4 w-4" />
                                            View Archived
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Search Bar */}
                            <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
                                <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <div className="relative min-w-0 flex-1">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                        <Input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Search by ID, Name, Email, or Role"
                                            className="w-full border py-2.5 pr-3 pl-10 transition-all outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md transition-all duration-300 hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg sm:w-auto"
                                    >
                                        <Search className="mr-2 h-4 w-4" />
                                        Search
                                    </Button>
                                </form>
                            </div>

                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Code</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-muted/50">
                                                <TableCell>{user.id}</TableCell>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell className="font-mono">{user.registration_code || '-'}</TableCell>
                                                <TableCell>{user.email || '-'}</TableCell>
                                                <TableCell>{user.roles.length > 0 ? user.roles.join(', ') : 'No Role'}</TableCell>
                                                <TableCell>
                                                    {user.status === 'pending' && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-yellow-300 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                        >
                                                            Pending
                                                        </Badge>
                                                    )}
                                                    {user.status === 'approved' && (
                                                        <Badge
                                                            variant="default"
                                                            className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                                                        >
                                                            Approved
                                                        </Badge>
                                                    )}
                                                    {user.status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                                                    {!user.status && <span className="text-muted-foreground">-</span>}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-wrap justify-end gap-1">
                                                        {user.status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="default"
                                                                    className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                                                                    onClick={() => setApproveUserId(user.id)}
                                                                >
                                                                    Approve
                                                                </Button>
                                                                <Button size="sm" variant="destructive" onClick={() => setRejectUserId(user.id)}>
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                        <Button size="sm" variant="outline" asChild>
                                                            <Link href={route('users.show', { user: user.id })}>View</Link>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md transition-all duration-300 hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg"
                                                            asChild
                                                        >
                                                            <Link href={route('users.edit', { user: user.id })}>Edit</Link>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
                                                            onClick={() => setResetPasswordUserId(user.id)}
                                                        >
                                                            Reset Password
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => setArchiveUserId(user.id)}>
                                                            Archive
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Approve Confirmation Dialog */}
            <AlertDialog open={!!approveUserId} onOpenChange={() => setApproveUserId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to approve this user? They will be able to access the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => approveUserId && handleApprove(approveUserId)}
                            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                        >
                            Approve
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Confirmation Dialog */}
            <AlertDialog open={!!rejectUserId} onOpenChange={() => setRejectUserId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject User</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to reject this user? This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => rejectUserId && handleReject(rejectUserId)}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Reject
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Archive Confirmation Dialog */}
            <AlertDialog open={!!archiveUserId} onOpenChange={() => setArchiveUserId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to archive this user? They will be moved to the archived users list.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => archiveUserId && handleArchive(archiveUserId)}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Archive
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reset Password Dialog */}
            <Dialog
                open={!!resetPasswordUserId}
                onOpenChange={(open) => {
                    if (!open) {
                        setResetPasswordUserId(null);
                        setResetPasswordResult(null);
                    }
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            {resetPasswordResult
                                ? 'The password has been reset successfully. Share the new password with the user.'
                                : "Are you sure you want to reset this user's password? A new random password will be generated."}
                        </DialogDescription>
                    </DialogHeader>

                    {resetPasswordResult ? (
                        <div className="space-y-4 py-4">
                            <div className="rounded-md bg-amber-50 p-3 text-sm dark:bg-amber-900/20">
                                <p className="mb-2 font-medium text-amber-800 dark:text-amber-400">New Password</p>
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-mono text-lg font-bold text-amber-900 dark:text-amber-300">{resetPasswordResult}</p>
                                    <Button
                                        size="sm"
                                        className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
                                        onClick={async () => {
                                            try {
                                                await navigator.clipboard.writeText(resetPasswordResult);
                                                setCopiedReset(true);
                                                setTimeout(() => setCopiedReset(false), 2000);
                                            } catch (err) {
                                                console.error('Failed to copy:', err);
                                            }
                                        }}
                                    >
                                        {copiedReset ? 'Copied!' : 'Copy'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <DialogFooter className="gap-2">
                        {resetPasswordResult ? (
                            <Button
                                onClick={() => {
                                    setResetPasswordUserId(null);
                                    setResetPasswordResult(null);
                                }}
                            >
                                Done
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setResetPasswordUserId(null)}>
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
                                    disabled={resetLoading}
                                    onClick={async () => {
                                        if (resetPasswordUserId) {
                                            await handleResetPassword(resetPasswordUserId);
                                        }
                                    }}
                                >
                                    {resetLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Resetting...
                                        </>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Maintenance Toggle Confirmation */}
            <AlertDialog open={maintenanceConfirm} onOpenChange={setMaintenanceConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{maintenance ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {maintenance ? (
                                <>
                                    This will <strong>disable</strong> maintenance mode. All users will be able to access the system normally.
                                </>
                            ) : (
                                <>
                                    This will <strong>enable</strong> maintenance mode. All Healthworker users will be logged out on their next
                                    request and redirected to the home page. Only Admin users can access the system.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmMaintenanceToggle}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Codes Modal */}
            <Dialog open={showCodeModal} onOpenChange={setShowCodeModal}>
                <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Registration Codes</DialogTitle>
                        <DialogDescription>View and manage registration codes for admin users.</DialogDescription>
                    </DialogHeader>
                    <div className="mb-4 flex items-center justify-between">
                        <Input
                            type="text"
                            value={codeSearch}
                            onChange={(e) => setCodeSearch(e.target.value)}
                            placeholder="Search codes..."
                            className="w-64 border transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400"
                        />
                        <Button
                            onClick={copyAllCodes}
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md transition-all duration-300 hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg"
                        >
                            Copy All
                        </Button>
                    </div>
                    {modalLoading ? (
                        <div className="py-8 text-center">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCodes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                                            No codes found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCodes.map((code) => (
                                        <TableRow key={code.id} className="hover:bg-muted/50">
                                            <TableCell className="font-mono">{code.code}</TableCell>
                                            <TableCell>{code.expires_at ? new Date(code.expires_at).toLocaleString() : 'No expiry'}</TableCell>
                                            <TableCell>{getStatusBadge(code.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md transition-all duration-300 hover:from-teal-600 hover:to-cyan-600"
                                                        onClick={() => copyToClipboard(code.code)}
                                                    >
                                                        {copiedCode === code.code ? 'Copied!' : 'Copy'}
                                                    </Button>
                                                    {(code.status === 'used' || code.status === 'expired') && (
                                                        <Button size="sm" variant="destructive" onClick={() => setDeleteCodeId(code.id)}>
                                                            Delete
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                    <div className="mt-4 text-sm text-muted-foreground">Total: {filteredCodes.length} code(s)</div>
                </DialogContent>
            </Dialog>

            {/* Delete Code Confirmation */}
            <AlertDialog open={!!deleteCodeId} onOpenChange={() => setDeleteCodeId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Code</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to delete this code? This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteCode} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Create User Modal */}
            <Dialog
                open={showCreateModal}
                onOpenChange={(open) => {
                    if (!open) {
                        setShowCreateModal(false);
                        setCreateSuccess('');
                        setCreateError('');
                        setGeneratedCode('');
                        setGeneratedPassword('');
                    }
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create User</DialogTitle>
                        <DialogDescription>Create a new user with registration code.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value.replace(/[^a-zA-ZñÑ\s'-.]/g, '') })}
                                placeholder="Full name"
                                className="border transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                placeholder="Email address"
                                className="border transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400"
                            />
                        </div>

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="password"
                                    type="text"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    placeholder="Min 10 characters"
                                    minLength={10}
                                    className="border transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400"
                                    required
                                />
                                <Button
                                    type="button"
                                    className="bg-gradient-to-r from-amber-500 to-yellow-500 text-sm shadow-md hover:from-amber-600 hover:to-yellow-600"
                                    onClick={generatePassword}
                                >
                                    Generate
                                </Button>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="role">Role</Label>
                            <select
                                id="role"
                                value={newUser.role}
                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                className="w-full rounded-md border px-3 py-2.5 text-sm transition-all outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                required
                            >
                                <option value="Healthworker">Healthworker</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        {createError && <div className="text-sm text-destructive">{createError}</div>}

                        {createSuccess && generatedPassword && (
                            <div className="rounded-md bg-green-50 p-3 text-sm dark:bg-green-900/20">
                                <p className="mb-2 font-medium text-green-800 dark:text-green-400">User created successfully!</p>
                                <div className="flex items-center justify-between gap-2">
                                    <div>
                                        {generatedCode ? (
                                            <>
                                                <p className="text-xs text-green-600 dark:text-green-400">Code - Password:</p>
                                                <p className="font-mono text-lg font-bold text-green-900 dark:text-green-300">
                                                    {generatedCode} - {generatedPassword}
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-xs text-green-600 dark:text-green-400">Password:</p>
                                                <p className="font-mono text-lg font-bold text-green-900 dark:text-green-300">{generatedPassword}</p>
                                            </>
                                        )}
                                    </div>
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                                        onClick={copyCredentials}
                                    >
                                        {copiedLogin ? 'Copied!' : 'Copy'}
                                    </Button>
                                </div>
                                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                                    {generatedCode
                                        ? 'Give these credentials to the healthworker'
                                        : 'Give this password to the healthworker (they will log in with their email)'}
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setNewUser({ name: '', email: '', password: '', role: 'Healthworker' });
                                setCreateSuccess('');
                                setCreateError('');
                                setGeneratedCode('');
                                setGeneratedPassword('');
                                setShowCreateModal(false);
                                router.reload({ only: ['users'], preserveState: true, preserveScroll: true });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-amber-500 to-yellow-500 text-sm shadow-md hover:from-amber-600 hover:to-yellow-600"
                            onClick={() => handleCreateUser(false)}
                            disabled={createLoading}
                        >
                            {createLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create & Add Another'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .stat-card {
                    animation: fadeInUp 0.5s ease-out forwards;
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .stat-card:nth-child(1) { animation-delay: 0.1s; }
                .stat-card:nth-child(2) { animation-delay: 0.2s; }
                .stat-card:nth-child(3) { animation-delay: 0.3s; }
                .stat-card:nth-child(4) { animation-delay: 0.4s; }
                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
                }
            `}</style>
        </AppLayout>
    );
}
