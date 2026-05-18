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
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import { smartToast } from '@/utils/smartToast';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertTriangle, Calendar, Database, FileText, HardDrive, Loader2, RefreshCw, Trash2, UploadCloud } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Backup = {
    filename: string;
    path: string;
    size: string;
    size_bytes: number;
    date: string;
    timestamp: number;
    source: string;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Database Maintenance', href: route('admin.database.index') }];

interface Props {
    backups: Backup[];
}

export default function DatabaseMaintenance({ backups }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [loading, setLoading] = useState(false);
    const [restoring, setRestoring] = useState(false);

    const [showRestoreDialog, setShowRestoreDialog] = useState(false);
    const [selectedRestoreBackup, setSelectedRestoreBackup] = useState<Backup | null>(null);
    const [confirmationText, setConfirmationText] = useState('');

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedDeleteBackup, setSelectedDeleteBackup] = useState<Backup | null>(null);

    useEffect(() => {
        if (flash?.success) {
            smartToast.success(flash.success);
        } else if (flash?.error) {
            smartToast.error(flash.error);
        }
    }, [flash]);

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
        const loadingToast = smartToast.loading('Creating backup — this may take a few seconds...');

        router.post(
            route('admin.database.backup'),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    smartToast.dismiss(loadingToast);
                },
                onError: (errors) => {
                    smartToast.dismiss(loadingToast);
                    smartToast.error(errors?.message || 'Failed to trigger backup.');
                },
                onFinish: () => {
                    setLoading(false);
                },
            },
        );
    };

    const refreshBackupList = () => {
        router.reload({ only: ['backups'] });
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
            route('admin.database.restore'),
            {
                backup_file: selectedRestoreBackup.path,
                confirmation: confirmationText,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    smartToast.dismiss(loadingToast);
                    closeRestoreDialog();
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                },
                onError: (errors) => {
                    smartToast.dismiss(loadingToast);
                    const errorMsg = errors?.message || 'Failed to restore database';
                    smartToast.error(errorMsg);
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

        router.delete(route('admin.database.delete'), {
            data: { backup_file: selectedDeleteBackup.path },
            preserveScroll: true,
            onSuccess: () => {
                closeDeleteDialog();
            },
            onError: () => {
                smartToast.error('Failed to delete backup. Please try again.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Database Maintenance" />

            <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-cyan-50/50">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(13,148,136,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.12),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Pill Badge */}
                    <div className="mb-6 pt-8 text-center">
                        <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-teal-100/50 bg-white/90 px-6 py-3 shadow-lg backdrop-blur-sm">
                            <Database className="h-6 w-6 text-teal-600" />
                            <span className="text-sm font-semibold text-teal-700">Database Management</span>
                        </div>
                    </div>

                    {/* Glassmorphic Header Card */}
                    <div className="relative mb-8 text-center">
                        <div className="relative mx-auto max-w-2xl rounded-3xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                            <div className="flex items-center justify-center gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 opacity-50 blur-lg" />
                                    <div className="relative rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 p-4 shadow-lg">
                                        <HardDrive className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                                        Database Maintenance
                                    </h1>
                                    <p className="mt-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                                        <Database className="h-4 w-4" />
                                        Backup and restore your database
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="stat-card rounded-xl border border-teal-100/50 bg-white dark:bg-gray-800/80 p-4 shadow-md transition-all hover:border-teal-200 hover:shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Total Backups</p>
                                    <p className="mt-1 text-2xl font-bold text-teal-600">{backups.length}</p>
                                </div>
                                <div className="rounded-full bg-teal-50 p-2.5">
                                    <HardDrive className="h-5 w-5 text-teal-500" />
                                </div>
                            </div>
                        </div>
                        <div className="stat-card rounded-xl border border-cyan-100/50 bg-white dark:bg-gray-800/80 p-4 shadow-md transition-all hover:border-cyan-200 hover:shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Total Size</p>
                                    <p className="mt-1 text-2xl font-bold text-cyan-600">{formatTotalSize(totalBackupsSize)}</p>
                                </div>
                                <div className="rounded-full bg-cyan-50 p-2.5">
                                    <FileText className="h-5 w-5 text-cyan-500" />
                                </div>
                            </div>
                        </div>
                        <div className="stat-card rounded-xl border border-green-100/50 bg-white dark:bg-gray-800/80 p-4 shadow-md transition-all hover:border-green-200 hover:shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Latest Backup</p>
                                    <p className="mt-1 text-2xl font-bold text-green-600">
                                        {backups.length > 0
                                            ? new Date(backups[0].timestamp * 1000).toLocaleDateString()
                                            : 'None'}
                                    </p>
                                </div>
                                <div className="rounded-full bg-green-50 p-2.5">
                                    <Calendar className="h-5 w-5 text-green-500" />
                                </div>
                            </div>
                        </div>
                        <div className="stat-card rounded-xl border border-teal-100/50 bg-white dark:bg-gray-800/80 p-4 shadow-md transition-all hover:border-teal-200 hover:shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Storage Engine</p>
                                    <p className="mt-1 text-2xl font-bold text-teal-600">SQLite</p>
                                </div>
                                <div className="rounded-full bg-teal-50 p-2.5">
                                    <Database className="h-5 w-5 text-teal-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Create Backup Section */}
                    <Card className="mb-8 border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                        <CardHeader className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10">
                            <CardTitle className="flex items-center gap-2">
                                <UploadCloud className="h-5 w-5 text-teal-600" />
                                Create Database Backup
                            </CardTitle>
                            <CardDescription>
                                Create a complete backup of your database. This backup can be used to restore your data if needed.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={handleBackup}
                                disabled={loading}
                                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md transition-all duration-300 hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg gap-2"
                            >
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
                    <Card className="mb-8 border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                        <CardHeader className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <HardDrive className="h-5 w-5 text-teal-600" />
                                    Available Backups
                                </CardTitle>
                                <Button onClick={refreshBackupList} variant="outline" size="sm" className="gap-1">
                                    <RefreshCw className="h-4 w-4" />
                                    Refresh
                                </Button>
                            </div>
                            <CardDescription>Manage your existing database backups</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {backups.length === 0 ? (
                                <div className="flex min-h-[300px] flex-col items-center justify-center p-12">
                                    <div className="mb-6 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 p-8">
                                        <HardDrive className="h-16 w-16 text-teal-600" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-gray-900">No backups available</h3>
                                    <p className="max-w-md text-center text-gray-600">
                                        Create your first backup above to start protecting your data.
                                    </p>
                                </div>
                            ) : (
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
                                            <TableRow key={backup.filename}>
                                                <TableCell className="font-medium">{backup.filename}</TableCell>
                                                <TableCell>{backup.size}</TableCell>
                                                <TableCell>{backup.date}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
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
                            )}
                        </CardContent>
                    </Card>
                </div>
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
                                <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                                    <p className="mb-2 font-semibold">This action is IRREVERSIBLE and will:</p>
                                    <ul className="ml-4 list-disc space-y-1">
                                        <li>Completely replace your current database</li>
                                        <li>Erase ALL existing data</li>
                                        <li>
                                            Restore data from: <strong>{selectedRestoreBackup?.filename}</strong>
                                        </li>
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
                            Are you sure you want to delete the backup <strong>{selectedDeleteBackup?.filename}</strong>? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeDeleteDialog}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="gap-2 bg-red-600 hover:bg-red-700">
                            <Trash2 className="h-4 w-4" />
                            Delete Backup
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
