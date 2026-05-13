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
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

type Category = {
    id: number;
    name: string;
    slug: string;
    color: string;
};

type Announcement = {
    id: number;
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
    { title: 'Announcements', href: '/admin/announcements' },
    { title: 'Archived Announcements', href: '/admin/announcements-archived' },
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
            await router.post(`/admin/announcements/${id}/restore`);
            smartToast.success('Announcement restored successfully!');
        } catch (err) {
            smartToast.error('Failed to restore announcement.');
        } finally {
            setLoading(null);
            setRestoreId(null);
        }
    };

    const handleForceDelete = async (id: number) => {
        setLoading(id);
        try {
            await router.delete(`/admin/announcements/${id}/force-delete`);
            smartToast.success('Announcement permanently deleted.');
        } catch (err) {
            smartToast.error('Failed to delete announcement.');
        } finally {
            setLoading(null);
            setDeleteId(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archived Announcements" />
            <div className="m-4 mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">Archived Announcements</h1>
                <Button variant="secondary" asChild>
                    <Link href="/admin/announcements">Back to Announcements</Link>
                </Button>
            </div>

            <div className="m-4 overflow-x-auto rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Published</TableHead>
                            <TableHead>Deleted Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {announcements.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                    No archived announcements found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            announcements.map((announcement) => (
                                <TableRow key={announcement.id} className="hover:bg-muted/50">
                                    <TableCell>{announcement.id}</TableCell>
                                    <TableCell className="font-medium">{announcement.title}</TableCell>
                                    <TableCell>
                                        <Badge
                                            style={{
                                                backgroundColor: `var(--${announcement.category.color || 'primary'})`,
                                                color: 'white',
                                            }}
                                        >
                                            {announcement.category.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{announcement.author ?? '-'}</TableCell>
                                    <TableCell>{new Date(announcement.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{new Date(announcement.deleted_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="default"
                                                onClick={() => setRestoreId(announcement.id)}
                                                disabled={loading === announcement.id}
                                            >
                                                {loading === announcement.id ? (
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
                                                onClick={() => setDeleteId(announcement.id)}
                                                disabled={loading === announcement.id}
                                            >
                                                {loading === announcement.id ? (
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
                        <AlertDialogTitle>Restore Announcement</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to restore this announcement? It will be visible again.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => restoreId && handleRestore(restoreId)}
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