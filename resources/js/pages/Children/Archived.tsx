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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import { smartToast } from '@/utils/smartToast';
import { Head, Link, router } from '@inertiajs/react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

type Child = {
    id: number;
    slug?: string;
    fullname: string;
    first_name: string;
    middle_initial: string | null;
    last_name: string;
    sex: string;
    age: number | null;
    deleted_at: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Children', href: route('children.index') },
    { title: 'Archived Children', href: route('children.archived') },
];

interface Props {
    children: Child[];
}

export default function Archived({ children }: Props) {
    const [restoreId, setRestoreId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [loading, setLoading] = useState<number | null>(null);

    const handleRestore = async (id: number) => {
        setLoading(id);
        try {
            await router.post(route('children.restore', { id }));
            smartToast.success('Child restored successfully!');
        } catch (err) {
            smartToast.error('Failed to restore child.');
        } finally {
            setLoading(null);
            setRestoreId(null);
        }
    };

    const handleForceDelete = async (id: number) => {
        setLoading(id);
        try {
            await router.delete(route('children.forceDelete', { id }));
            smartToast.success('Child permanently deleted.');
        } catch (err) {
            smartToast.error('Failed to delete child.');
        } finally {
            setLoading(null);
            setDeleteId(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archived Children" />
            <div className="m-4 mb-4 flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-xl font-bold">Archived Children</h1>
                <Button variant="outline" size="sm" asChild>
                    <Link href={route('children.index')}>
                     <ArrowLeft className="mr-2 h-4 w-4" />
                     Back to Children</Link>
                </Button>
            </div>

            <div className="m-4 overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Sex</TableHead>
                            <TableHead>Age (months)</TableHead>
                            <TableHead>Deleted Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {children.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                    No archived children found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            children.map((child) => (
                                <TableRow key={child.id} className="hover:bg-muted/50">
                                    <TableCell>{child.id}</TableCell>
                                    <TableCell>{child.fullname}</TableCell>
                                    <TableCell>{child.sex}</TableCell>
                                    <TableCell>{child.age ?? '-'}</TableCell>
                                    <TableCell>{new Date(child.deleted_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            <Button
                                                size="sm"
                                                variant="default"
                                                onClick={() => setRestoreId(child.id)}
                                                disabled={loading === child.id}
                                            >
                                                {loading === child.id ? (
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
                                                onClick={() => setDeleteId(child.id)}
                                                disabled={loading === child.id}
                                            >
                                                {loading === child.id ? (
                                                    <>
                                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="hidden sm:inline">Delete </span>
                                                        Permanently
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Restore Confirmation */}
            <AlertDialog open={!!restoreId} onOpenChange={() => setRestoreId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restore Child</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to restore this child? Their data will be visible again.
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

            {/* Permanent Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Permanently</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete this child? This action cannot be undone and all related data will be lost.
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
        </AppLayout>
    );
}
