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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { smartToast } from '@/utils/smartToast';
import { Head, Link, router } from '@inertiajs/react';
import { ArchiveRestore, Loader2, Megaphone, Trash2 } from 'lucide-react';
import { route } from '@/lib/routes';
import { useState } from 'react';

type Category = {
    id: number;
    name: string;
    slug: string;
    color: string;
};

type Announcement = {
    id: number;
    slug?: string;
    title: string;
    category_id: number;
    category: Category;
    date: string;
    end_date: string | null;
    author: string | null;
    summary: string;
    deleted_at: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Announcements', href: route('announcements.index') },
    { title: 'Archived Announcements', href: route('announcements.archived') },
];

interface Props {
    announcements: Announcement[];
}

export default function Archived({ announcements }: Props) {
    const [restoreId, setRestoreId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [loading, setLoading] = useState<number | null>(null);

    const handleRestore = async (id: number) => {
        setLoading(id);
        try {
            await router.post(route('announcements.restore', { id }),);
            smartToast.success('Announcement restored successfully!');
        } catch {
            smartToast.error('Failed to restore announcement.');
        } finally {
            setLoading(null);
            setRestoreId(null);
        }
    };

    const handleForceDelete = async (id: number) => {
        setLoading(id);
        try {
            await router.delete(route('announcements.forceDelete', { id }),);
            smartToast.success('Announcement permanently deleted.');
        } catch {
            smartToast.error('Failed to delete announcement.');
        } finally {
            setLoading(null);
            setDeleteId(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archived Announcements" />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(13,148,136,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.12),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mb-6 text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-100/50 bg-white/90 px-5 py-2 shadow-lg backdrop-blur-sm">
                            <ArchiveRestore className="h-5 w-5 text-amber-600" />
                            <span className="text-sm font-semibold text-amber-700">Archived</span>
                        </div>

                        <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
                            <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 bg-clip-text text-transparent">
                                Archived Announcements
                            </span>
                        </h1>
                        <p className="mx-auto max-w-xl text-gray-600">Manage and restore previously archived announcements</p>
                    </div>

                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            {announcements.length} {announcements.length === 1 ? 'announcement' : 'announcements'} archived
                        </p>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('announcements.index')}>
                                <Megaphone className="mr-1.5 h-4 w-4" />
                                Back to Announcements
                            </Link>
                        </Button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-teal-100/50 bg-white shadow-md">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gradient-to-r from-teal-50 to-cyan-50">
                                    <TableHead className="font-bold text-teal-800">ID</TableHead>
                                    <TableHead className="font-bold text-teal-800">Title</TableHead>
                                    <TableHead className="font-bold text-teal-800">Category</TableHead>
                                    <TableHead className="font-bold text-teal-800">Author</TableHead>
                                    <TableHead className="font-bold text-teal-800">Published</TableHead>
                                    <TableHead className="font-bold text-teal-800">Deleted Date</TableHead>
                                    <TableHead className="font-bold text-teal-800">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {announcements.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <ArchiveRestore className="h-8 w-8 text-gray-300" />
                                                <p className="font-medium text-gray-500">No archived announcements found.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    announcements.map((announcement) => (
                                        <TableRow key={announcement.id} className="hover:bg-teal-50/30">
                                            <TableCell className="font-medium">{announcement.id}</TableCell>
                                            <TableCell className="font-medium text-gray-900">{announcement.title}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    className="font-semibold shadow-sm"
                                                    style={{
                                                        backgroundColor: `var(--${announcement.category.color || 'primary'})`,
                                                        color: 'white',
                                                    }}
                                                >
                                                    {announcement.category.name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-600">{announcement.author ?? '-'}</TableCell>
                                            <TableCell className="text-gray-600">{new Date(announcement.date).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-gray-600">{new Date(announcement.deleted_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        onClick={() => setRestoreId(announcement.id)}
                                                        disabled={loading === announcement.id}
                                                        className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm hover:from-teal-600 hover:to-cyan-600"
                                                    >
                                                        {loading === announcement.id ? (
                                                            <>
                                                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                                Restoring...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ArchiveRestore className="mr-1 h-3 w-3" />
                                                                Restore
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => setDeleteId(announcement.id)}
                                                        disabled={loading === announcement.id}
                                                    >
                                                        {loading === announcement.id ? (
                                                            <>
                                                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                                Deleting...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Trash2 className="mr-1 h-3 w-3" />
                                                                Delete
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
                </div>
            </div>

            <AlertDialog open={!!restoreId} onOpenChange={() => setRestoreId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restore Announcement</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to restore this announcement? It will be visible again.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => restoreId && handleRestore(restoreId)}
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
                        >
                            Restore
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Permanently</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete this announcement? This action cannot be undone and the image will be removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && handleForceDelete(deleteId)}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
