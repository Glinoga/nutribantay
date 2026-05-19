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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { smartToast } from '@/utils/smartToast';
import { Head, Link, router } from '@inertiajs/react';
import { Archive, ArrowLeft, Loader2, Trash2, Users } from 'lucide-react';
import { route } from '@/lib/routes';
import { useState } from 'react';

type User = {
    id: number;
    name: string;
    email: string;
    deleted_at: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Archived Users',
        href: route('users.archived'),
    },
];

interface Props {
    users: User[];
}

export default function Archived({ users }: Props) {
    const [restoreId, setRestoreId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [loading, setLoading] = useState<number | null>(null);

    const handleRestore = async (id: number) => {
        setLoading(id);
        try {
            await router.post(route('users.restore', { id }));
            smartToast.success('User restored successfully!');
        } catch (err) {
            smartToast.error('Failed to restore user.');
        } finally {
            setLoading(null);
            setRestoreId(null);
        }
    };

    const handleForceDelete = async (id: number) => {
        setLoading(id);
        try {
            await router.delete(route('users.forceDelete', { id }));
            smartToast.success('User permanently deleted.');
        } catch (err) {
            smartToast.error('Failed to delete user.');
        } finally {
            setLoading(null);
            setDeleteId(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archived Users" />

            <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-cyan-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(13,148,136,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.12),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    {/* Pill Badge */}
                    <div className="mb-6 text-center">
                        <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-teal-100/50 bg-white/90 px-6 py-3 shadow-lg backdrop-blur-sm dark:border-teal-800/50 dark:bg-gray-800/90">
                                <Archive className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                                <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">Archived Users</span>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-3xl font-bold text-transparent">
                                Archived Users
                            </h1>
                            <p className="mt-1 flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <Users className="h-4 w-4" />
                                View and manage archived user accounts
                            </p>
                        </div>
                        <Button variant="outline" className="border hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700" asChild>
                            <Link href={route('users.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Users
                            </Link>
                        </Button>
                    </div>

                    {/* Table Card */}
                    <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 dark:border-gray-700">
                            <CardTitle className="flex items-center gap-2">
                                <Archive className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                Archived Users
                            </CardTitle>
                            <CardDescription>Restore or permanently delete archived user accounts</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {users.length === 0 ? (
                                <div className="flex min-h-[300px] flex-col items-center justify-center p-12">
                                    <div className="mb-6 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 p-8 dark:from-teal-900/30 dark:to-cyan-900/30">
                                        <Archive className="h-16 w-16 text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-50">No archived users</h3>
                                    <p className="max-w-md text-center text-gray-600 dark:text-gray-300">
                                        There are no archived users at the moment.
                                    </p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Deleted Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-muted/50">
                                                <TableCell>{user.id}</TableCell>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{new Date(user.deleted_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="bg-green-600 hover:bg-green-700"
                                                            onClick={() => setRestoreId(user.id)}
                                                            disabled={loading === user.id}
                                                        >
                                                            {loading === user.id ? (
                                                                <>
                                                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                                    Restoring...
                                                                </>
                                                            ) : (
                                                                'Restore'
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => setDeleteId(user.id)}
                                                            disabled={loading === user.id}
                                                        >
                                                            {loading === user.id ? (
                                                                <>
                                                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                                    Deleting...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Trash2 className="mr-1 h-3 w-3" />
                                                                    Delete Permanently
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Restore Confirmation */}
            <AlertDialog open={!!restoreId} onOpenChange={() => setRestoreId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restore User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to restore this user? They will be able to access the system again.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => restoreId && handleRestore(restoreId)} className="bg-green-600 hover:bg-green-700">
                            Restore
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Permanant Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Permanently</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete this user? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteId && handleForceDelete(deleteId)} className="bg-destructive hover:bg-destructive/90">
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
            `}</style>
        </AppLayout>
    );
}
