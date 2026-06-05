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
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import { smartToast } from '@/utils/smartToast';
import { Head, Link, router } from '@inertiajs/react';
import { Archive, ArrowLeft, Download, Loader2, Printer, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

type DeletedChild = {
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

type OveragedChild = {
    id: number;
    slug?: string;
    fullname: string;
    first_name: string;
    middle_initial: string | null;
    last_name: string;
    sex: string;
    age: number | null;
    weight: number | null;
    height: number | null;
    bmi: number | null;
    birthdate: string | null;
    address: string | null;
    contact_number: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Children', href: route('children.index') },
    { title: 'Archived Children', href: route('children.archived') },
];

interface Props {
    deleted: DeletedChild[];
    overaged: OveragedChild[];
}

type Tab = 'deleted' | 'overaged';

export default function Archived({ deleted, overaged }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('deleted');
    const [restoreId, setRestoreId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [archiveId, setArchiveId] = useState<number | null>(null);
    const [loading, setLoading] = useState<number | null>(null);

    const handleRestore = async (id: number) => {
        if (loading !== null) return;
        setLoading(id);
        try {
            await router.post(route('children.restore', { id }));
            smartToast.success('Child restored successfully!');
        } catch {
            smartToast.error('Failed to restore child.');
        } finally {
            setLoading(null);
            setRestoreId(null);
        }
    };

    const handleForceDelete = async (id: number) => {
        if (loading !== null) return;
        setLoading(id);
        try {
            await router.delete(route('children.force-delete', { id }));
            smartToast.success('Child permanently deleted.');
        } catch {
            smartToast.error('Failed to delete child.');
        } finally {
            setLoading(null);
            setDeleteId(null);
        }
    };

    const handleArchive = async (child: OveragedChild) => {
        if (loading !== null) return;
        setLoading(child.id);
        try {
            await router.delete(route('children.destroy', { child: child.slug ?? child.id }));
            smartToast.success('Child archived successfully.');
        } catch {
            smartToast.error('Failed to archive child.');
        } finally {
            setLoading(null);
            setArchiveId(null);
        }
    };

    const handleExportPrint = () => {
        const params = new URLSearchParams();
        params.set('type', 'overaged');
        window.location.href = `${route('children.print')}?${params.toString()}`;
    };

    const handleExportCSV = () => {
        const params = new URLSearchParams();
        params.set('type', 'overaged');
        window.location.href = `${route('children.export')}?${params.toString()}`;
    };

    const tabs: { key: Tab; label: string; icon: typeof Archive; count: number }[] = [
        { key: 'deleted', label: 'Archived', icon: Archive, count: deleted.length },
        { key: 'overaged', label: 'Overaged (60+ mo)', icon: Users, count: overaged.length },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archived Children" />
            <div className="m-4 mb-4 flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-xl font-bold">Archived Children</h1>
                <Button variant="outline" size="sm" asChild>
                    <Link href={route('children.index')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Children
                    </Link>
                </Button>
            </div>

            <div className="mx-4 mb-4 flex gap-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-cyan-600 text-white shadow-sm'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                            <span
                                className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {activeTab === 'deleted' && (
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
                            {deleted.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                        No archived children found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                deleted.map((child) => (
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
            )}

            {activeTab === 'overaged' && (
                <div className="m-4">
                    <div className="mb-4 flex flex-wrap gap-2">
                        <Button
                            onClick={handleExportPrint}
                            className="cursor-pointer bg-gradient-to-r from-cyan-600 to-cyan-400 text-white hover:from-cyan-700 hover:to-cyan-500"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print View
                        </Button>
                        <Button
                            onClick={handleExportCSV}
                            className="cursor-pointer bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>

                    <div className="overflow-x-auto rounded-md border">
                        <Table>
                            <TableCaption className="text-muted-foreground">Children aged 60 months and above — {overaged.length} total</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Sex</TableHead>
                                    <TableHead>Age (months)</TableHead>
                                    <TableHead>Weight (kg)</TableHead>
                                    <TableHead>Height (cm)</TableHead>
                                    <TableHead>BMI</TableHead>
                                    <TableHead>Birthdate</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {overaged.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={12} className="py-8 text-center text-muted-foreground">
                                            No overaged children found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    overaged.map((child) => (
                                        <TableRow key={child.id} className="hover:bg-muted/50">
                                            <TableCell>{child.id}</TableCell>
                                            <TableCell>
                                                <Link
                                                    href={route('children.show', { child: child.slug ?? child.id })}
                                                    className="font-medium text-cyan-600 hover:underline dark:text-cyan-400"
                                                >
                                                    {child.fullname}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{child.sex}</TableCell>
                                            <TableCell>{child.age ?? '-'}</TableCell>
                                            <TableCell>{child.weight ?? '-'}</TableCell>
                                            <TableCell>{child.height ?? '-'}</TableCell>
                                            <TableCell>{child.bmi ?? '-'}</TableCell>
                                            <TableCell>{child.birthdate ?? '-'}</TableCell>
                                            <TableCell className="max-w-[200px] truncate">{child.address ?? '-'}</TableCell>
                                            <TableCell>{child.contact_number ?? '-'}</TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => setArchiveId(child.id)}
                                                    disabled={loading === child.id}
                                                >
                                                    {loading === child.id ? (
                                                        <>
                                                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                            Archiving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Trash2 className="mr-1 h-3 w-3" />
                                                            Archive
                                                        </>
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

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
                        <AlertDialogAction
                            onClick={() => restoreId && handleRestore(restoreId)}
                            disabled={loading !== null}
                            className="bg-green-600 hover:bg-green-700"
                        >
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
                        <AlertDialogAction
                            onClick={() => deleteId && handleForceDelete(deleteId)}
                            disabled={loading !== null}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Archive Overaged Confirmation */}
            <AlertDialog open={!!archiveId} onOpenChange={() => setArchiveId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive Child</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will move this child to the archived section. The record can be restored later if needed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                const child = overaged.find((c) => c.id === archiveId);
                                if (child) handleArchive(child);
                            }}
                            disabled={loading !== null}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Archive
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
