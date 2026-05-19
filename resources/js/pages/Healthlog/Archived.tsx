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
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

type HealthLog = {
    id: number;
    child_id: number;
    weight: number | null;
    height: number | null;
    bmi: number | null;
    nutrition_status: string | null;
    deleted_at: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Health Logs', href: route('children.index') },
    { title: 'Archived Health Logs', href: route('healthlogs.archived') },
];

interface Props {
    healthlogs: HealthLog[];
}

export default function Archived({ healthlogs }: Props) {
    const [restoreId, setRestoreId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [loading, setLoading] = useState<number | null>(null);

    const handleRestore = async (id: number) => {
        setLoading(id);
        try {
            await router.post(route('healthlogs.restore', { id }));
            smartToast.success('Health log restored successfully!');
        } catch (err) {
            smartToast.error('Failed to restore health log.');
        } finally {
            setLoading(null);
            setRestoreId(null);
        }
    };

    const handleForceDelete = async (id: number) => {
        setLoading(id);
        try {
            await router.delete(route('healthlogs.forceDelete', { id }));
            smartToast.success('Health log permanently deleted.');
        } catch (err) {
            smartToast.error('Failed to delete health log.');
        } finally {
            setLoading(null);
            setDeleteId(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archived Health Logs" />
            <div className="m-4 mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">Archived Health Logs</h1>
                <Button variant="secondary" asChild>
                    <Link href={route('children.index')}>Back to Children</Link>
                </Button>
            </div>

            <div className="m-4 overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Child ID</TableHead>
                            <TableHead>Weight (kg)</TableHead>
                            <TableHead>Height (cm)</TableHead>
                            <TableHead>BMI</TableHead>
                            <TableHead>Nutrition Status</TableHead>
                            <TableHead>Deleted Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {healthlogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                                    No archived health logs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            healthlogs.map((log) => (
                                <TableRow key={log.id} className="hover:bg-muted/50">
                                    <TableCell>{log.id}</TableCell>
                                    <TableCell>{log.child_id}</TableCell>
                                    <TableCell>{log.weight ?? '-'}</TableCell>
                                    <TableCell>{log.height ?? '-'}</TableCell>
                                    <TableCell>{log.bmi ?? '-'}</TableCell>
                                    <TableCell>{log.nutrition_status ?? '-'}</TableCell>
                                    <TableCell>{new Date(log.deleted_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button size="sm" variant="default" onClick={() => setRestoreId(log.id)} disabled={loading === log.id}>
                                                {loading === log.id ? (
                                                    <>
                                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                        Restoring...
                                                    </>
                                                ) : (
                                                    'Restore'
                                                )}
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => setDeleteId(log.id)} disabled={loading === log.id}>
                                                {loading === log.id ? (
                                                    <>
                                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    'Delete Permanently'
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
                        <AlertDialogTitle>Restore Health Log</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to restore this health log? It will be visible again.</AlertDialogDescription>
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
                            Are you sure you want to permanently delete this health log? This action cannot be undone.
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
