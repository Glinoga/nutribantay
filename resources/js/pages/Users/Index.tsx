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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { route } from '@/lib/routes';
import { smartToast } from '@/utils/smartToast';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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

    // Modal states
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [codeSearch, setCodeSearch] = useState('');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Create User Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Healthworker', barangay: '' });
    const [createError, setCreateError] = useState('');
    const [createSuccess, setCreateSuccess] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [copiedLogin, setCopiedLogin] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    // Maintenance mode state
    const [maintenance, setMaintenance] = useState(false);

    // Confirmation dialogs
    const [approveUserId, setApproveUserId] = useState<number | null>(null);
    const [rejectUserId, setRejectUserId] = useState<number | null>(null);
    const [archiveUserId, setArchiveUserId] = useState<number | null>(null);
    const [deleteCodeId, setDeleteCodeId] = useState<number | null>(null);
    const [maintenanceConfirm, setMaintenanceConfirm] = useState(false);

    // Show barangay dropdown ONLY for nutribantay@gmail.com when creating Admin role
    const showBarangayDropdown = isSeededAdmin && newUser.role === 'Admin';

    const copyCredentials = async () => {
        const login = `${generatedCode} - ${generatedPassword}`;
        try {
            await navigator.clipboard.writeText(login);
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
                router.reload();
            } else {
                setNewUser({ name: '', email: '', password: '', role: 'Healthworker', barangay: '' });
            }
        } catch (err: unknown) {
            let message = 'Failed to create user';
            if (err instanceof Error) {
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
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            {/* Header */}
            <div className="m-4 mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">User List</h1>
                <div className="flex gap-2">
                    <Button
                        onClick={() => {
                            setCreateSuccess('');
                            setCreateError('');
                            setGeneratedCode('');
                            setGeneratedPassword('');
                            setNewUser({ name: '', email: '', password: '', role: 'Healthworker', barangay: '' });
                            setShowCreateModal(true);
                        }}
                    >
                        Create User
                    </Button>
                    <Button variant="secondary" asChild>
                        <Link href={route('users.archived')}>View Archived Users</Link>
                    </Button>
                </div>
            </div>

            {/* Maintenance Toggle */}
            <div className="m-4">
                <Button
                    onClick={toggleMaintenance}
                    variant={maintenance ? 'destructive' : 'default'}
                    className={maintenance ? '' : 'bg-green-600 hover:bg-green-700'}
                >
                    {maintenance ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
                </Button>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="m-4 flex items-center gap-2">
                <Input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by ID, Name, Email, or Role"
                    className="w-64"
                />
                <Button type="submit">Search</Button>
            </form>

            {/* Admin Codes Section */}
            <div className="m-4 mb-6 rounded-lg border p-4">
                <h2 className="mb-2 text-lg font-semibold">Admin Codes</h2>
                <div className="mb-3 flex items-center gap-2">
                    <Label htmlFor="count" className="text-gray-700">
                        Number of Codes:
                    </Label>
                    <Input id="count" type="number" min="1" value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-20" />
                    <Button onClick={generateAdminCodes} disabled={loading} variant="default">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            'Generate'
                        )}
                    </Button>
                    <Button onClick={openCodeModal} variant="secondary">
                        View All Codes
                    </Button>
                </div>
            </div>

            {/* Users Table */}
            <div className="m-4 overflow-x-auto rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="hover:bg-muted/50">
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell className="font-mono">{user.registration_code || '-'}</TableCell>
                                <TableCell>{user.email || '-'}</TableCell>
                                <TableCell>{user.roles.length > 0 ? user.roles.join(', ') : 'No Role'}</TableCell>
                                <TableCell>
                                    {user.status === 'pending' && (
                                        <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-800">
                                            Pending
                                        </Badge>
                                    )}
                                    {user.status === 'approved' && (
                                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                                            Approved
                                        </Badge>
                                    )}
                                    {user.status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                                    {!user.status && <span className="text-muted-foreground">-</span>}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        {user.status === 'pending' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => setApproveUserId(user.id)}
                                                >
                                                    Approve
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => setRejectUserId(user.id)}>
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                        <Button size="sm" variant="secondary" asChild>
                                            <Link href={route('users.show', { user: user.id })}>View</Link>
                                        </Button>
                                        <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" asChild>
                                            <Link href={route('users.edit', { user: user.id })}>Edit</Link>
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
                        <AlertDialogAction onClick={() => approveUserId && handleApprove(approveUserId)} className="bg-green-600 hover:bg-green-700">
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
                <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
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
                            className="w-64"
                        />
                        <Button onClick={copyAllCodes} variant="default">
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
                                    <TableHead>Barangay</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCodes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                            No codes found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCodes.map((code) => (
                                        <TableRow key={code.id} className="hover:bg-muted/50">
                                            <TableCell className="font-mono">{code.code}</TableCell>
                                            <TableCell>{code.barangay}</TableCell>
                                            <TableCell>{code.expires_at ? new Date(code.expires_at).toLocaleString() : 'No expiry'}</TableCell>
                                            <TableCell>{getStatusBadge(code.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="default" onClick={() => copyToClipboard(code.code)}>
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
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                placeholder="Full name"
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
                                    placeholder="Password"
                                    required
                                />
                                <Button type="button" variant="secondary" onClick={generatePassword}>
                                    Generate
                                </Button>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="role">Role</Label>
                            <select
                                id="role"
                                value={newUser.role}
                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value, barangay: '' })}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                required
                            >
                                <option value="Healthworker">Healthworker</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        {showBarangayDropdown && (
                            <div>
                                <Label htmlFor="barangay">Barangay</Label>
                                <Input
                                    id="barangay"
                                    type="text"
                                    value={newUser.barangay}
                                    onChange={(e) => setNewUser({ ...newUser, barangay: e.target.value })}
                                    placeholder="Enter barangay"
                                />
                            </div>
                        )}

                        {createError && <div className="text-sm text-destructive">{createError}</div>}

                        {createSuccess && generatedCode && (
                            <div className="rounded-lg bg-green-50 p-3 text-sm">
                                <p className="mb-2 font-medium text-green-800">User created successfully!</p>
                                <div className="flex items-center justify-between gap-2">
                                    <div>
                                        <p className="text-xs text-green-600">Code - Password:</p>
                                        <p className="font-mono text-lg font-bold text-green-900">
                                            {generatedCode} - {generatedPassword}
                                        </p>
                                    </div>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={copyCredentials}>
                                        {copiedLogin ? 'Copied!' : 'Copy'}
                                    </Button>
                                </div>
                                <p className="mt-1 text-xs text-green-600">Give these credentials to the healthworker</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setNewUser({ name: '', email: '', password: '', role: 'Healthworker', barangay: '' });
                                setCreateSuccess('');
                                setCreateError('');
                                setGeneratedCode('');
                                setGeneratedPassword('');
                                setShowCreateModal(false);
                                router.reload();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="secondary" onClick={() => handleCreateUser(false)} disabled={createLoading}>
                            {createLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create & Add Another'
                            )}
                        </Button>
                        <Button onClick={() => handleCreateUser(true)} disabled={createLoading}>
                            {createLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
