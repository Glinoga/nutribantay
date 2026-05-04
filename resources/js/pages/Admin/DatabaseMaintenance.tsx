import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { smartToast } from '@/utils/smartToast';
import { Head, router } from '@inertiajs/react';
import { Database, Download, Loader2, RefreshCw, Trash2, UploadCloud, AlertTriangle, CheckCircle2, HardDrive, FileText } from 'lucide-react';
import { useMemo, useState } from 'react';

type Backup = {
    filename: string;
    path: string;
    size: string;
    size_bytes: number;
    date: string;
    timestamp: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Database Maintenance', href: '/admin/database' },
];

interface Props {
    backups: Backup[];
}

export default function DatabaseMaintenance({ backups: initialBackups }: Props) {
    const [backups, setBackups] = useState<Backup[]>(initialBackups);
    const [loading, setLoading] = useState(false);
    const [restoring, setRestoring] = useState(false);

    // Restore confirmation state
    const [showRestoreDialog, setShowRestoreDialog] = useState(false);
    const [selectedRestoreBackup, setSelectedRestoreBackup] = useState<Backup | null>(null);
    const [confirmationText, setConfirmationText] = useState('');

    // Delete confirmation state
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedDeleteBackup, setSelectedDeleteBackup] = useState<Backup | null>(null);

    const totalBackupsSize = useMemo(() => {
        return backups.reduce((sum, b) => sum + b.size_bytes, 0);
    }, [backups]);

    const formatTotalSize = (bytes: number) => {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    };

    const handleBackup = () => {
        if (loading) return;

        setLoading(true);
        const loadingToast = smartToast.loading('Creating database backup...');

        router.post(
            '/admin/database/backup',
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    smartToast.dismiss(loadingToast);
                    smartToast.success('Database backup created successfully!');
                    refreshBackupList();
                },
                onError: () => {
                    smartToast.dismiss(loadingToast);
                    smartToast.error('Failed to create backup. Please try again.');
                },
                onFinish: () => {
                    setLoading(false);
                },
            },
        );
    };

    const refreshBackupList = () => {
        router.get(
            '/admin/database/list',
            {},
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    if (page.props.backups) {
                        setBackups(page.props.backups as Backup[]);
                    }
                },
            },
        );
    };

    const openRestoreDialog = (backup: Backup) => {
        setSelectedRestoreBackup(backup);
        setConfirmationText('');
        setShowRestoreDialog(true);
    };

    const closeRestoreDialog = () => {
        setShowRestoreDialog(false);
        setSelectedRestoreBackup(null);
        setConfirmationText('');
    };

    const handleRestore = () => {
        if (!selectedRestoreBackup || confirmationText !== 'RESTORE DATABASE') {
            return;
        }

        setRestoring(true);
        const loadingToast = smartToast.loading('Restoring database...');

        router.post(
            '/admin/database/restore',
            {
                backup_file: selectedRestoreBackup.path,
                confirmation: confirmationText,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    smartToast.dismiss(loadingToast);
                    smartToast.success('Database restored successfully!');
                    closeRestoreDialog();
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                },
                onError: (errors) => {
                    smartToast.dismiss(loadingToast);
                    const errorMsg = errors?.message || 'Failed to restore database';
                    if (typeof errorMsg === 'string' && errorMsg.includes('SQLite')) {
                        smartToast.error('This backup is incompatible (SQLite format). Please delete old backups and create new ones.');
                    } else {
                        smartToast.error(errorMsg);
                    }
                },
                onFinish: () => {
                    setRestoring(false);
                },
            },
        );
    };

    const openDeleteDialog = (backup: Backup) => {
        setSelectedDeleteBackup(backup);
        setShowDeleteDialog(true);
    };

    const closeDeleteDialog = () => {
        setShowDeleteDialog(false);
        setSelectedDeleteBackup(null);
    };

    const handleDelete = () => {
        if (!selectedDeleteBackup) return;

        router.delete('/admin/database/delete', {
            data: { backup_file: selectedDeleteBackup.path },
            preserveScroll: true,
            onSuccess: () => {
                smartToast.success('Backup deleted successfully!');
                refreshBackupList();
                closeDeleteDialog();
            },
            onError: () => {
                smartToast.error('Failed to delete backup. Please try again.');
            },
        });
    };

    const handleDownload = (backup: Backup) => {
        window.location.href = `/admin/database/download/${backup.filename}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Database Maintenance" />

            <div className="m-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                            <Database className="h-7 w-7 text-blue-600" />
                            Database Maintenance
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">Backup and restore your database</p>
                    </div>
                    <Button onClick={refreshBackupList} variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {/* Stats Card */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{backups.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatTotalSize(totalBackupsSize)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Latest Backup</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {backups.length > 0 ? new Date(backups[0].timestamp * 1000).toLocaleDateString() : 'None'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Backup Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UploadCloud className="h-5 w-5 text-blue-600" />
                            Create Database Backup
                        </CardTitle>
                        <CardDescription>Create a complete backup of your database. This backup can be used to restore your data if needed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleBackup} disabled={loading} className="gap-2">
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating Backup...
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="h-4 w-4" />
                                    Run Backup Now
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Backup List Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HardDrive className="h-5 w-5 text-blue-600" />
                            Available Backups
                        </CardTitle>
                        <CardDescription>Manage your existing database backups</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {backups.length === 0 ? (
                            <div className="py-8 text-center">
                                <HardDrive className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                <p className="text-gray-500">No backups available. Create your first backup above.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[40%]">Filename</TableHead>
                                            <TableHead>Size</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {backups.map((backup) => (
                                            <TableRow key={backup.filename} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">{backup.filename}</TableCell>
                                                <TableCell>{backup.size}</TableCell>
                                                <TableCell>{backup.date}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            onClick={() => handleDownload(backup)}
                                                            size="sm"
                                                            variant="outline"
                                                            className="gap-1 border-green-200 text-green-700 hover:bg-green-50"
                                                        >
                                                            <Download className="h-3 w-3" />
                                                            Download
                                                        </Button>
                                                        <Button
                                                            onClick={() => openRestoreDialog(backup)}
                                                            size="sm"
                                                            variant="outline"
                                                            className="gap-1 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                                                        >
                                                            <UploadCloud className="h-3 w-3" />
                                                            Restore
                                                        </Button>
                                                        <Button
                                                            onClick={() => openDeleteDialog(backup)}
                                                            size="sm"
                                                            variant="destructive"
                                                            className="gap-1"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Restore Confirmation Dialog */}
            <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            CRITICAL WARNING
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                                    <p className="mb-2 font-semibold">This action is IRREVERSIBLE and will:</p>
                                    <ul className="ml-4 list-disc space-y-1">
                                        <li>Completely replace your current database</li>
                                        <li>Erase ALL existing data</li>
                                        <li>Restore data from: <strong>{selectedRestoreBackup?.filename}</strong></li>
                                        <li>Create an automatic pre-restore backup</li>
                                    </ul>
                                </div>
                                <p className="text-sm text-gray-700">
                                    To confirm, type <span className="font-mono font-semibold text-red-600">RESTORE DATABASE</span> below:
                                </p>
                                <Input
                                    type="text"
                                    value={confirmationText}
                                    onChange={(e) => setConfirmationText(e.target.value)}
                                    placeholder="RESTORE DATABASE"
                                    className="font-mono focus:border-red-500"
                                    disabled={restoring}
                                />
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeRestoreDialog} disabled={restoring}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRestore}
                            disabled={confirmationText !== 'RESTORE DATABASE' || restoring}
                            className="gap-2 bg-red-600 hover:bg-red-700"
                        >
                            {restoring ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Restoring...
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="h-4 w-4" />
                                    Restore Database
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" />
                            Delete Backup
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the backup <strong>{selectedDeleteBackup?.filename}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeDeleteDialog}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 gap-2">
                            <Trash2 className="h-4 w-4" />
                            Delete Backup
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
