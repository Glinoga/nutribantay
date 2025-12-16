import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';

type Backup = {
    filename: string;
    path: string;
    size: string;
    size_bytes: number;
    date: string;
    timestamp: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Database Maintenance',
        href: '/admin/database',
    },
];

interface Props {
    backups: Backup[];
}

export default function DatabaseMaintenance({ backups: initialBackups }: Props) {
    const [backups, setBackups] = useState<Backup[]>(initialBackups);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Restore confirmation state
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
    const [confirmationText, setConfirmationText] = useState('');
    const [restoring, setRestoring] = useState(false);

    const handleBackup = async () => {
        if (loading) return;

        setLoading(true);
        setMessage(null);

        try {
            const response = await axios.post('/admin/database/backup');

            if (response.data.success) {
                setMessage({ type: 'success', text: response.data.message });

                // Refresh backup list
                await refreshBackupList();
            } else {
                setMessage({ type: 'error', text: response.data.message });
            }
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || '❌ Failed to create backup. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const refreshBackupList = async () => {
        try {
            const response = await axios.get('/admin/database/list');
            if (response.data.success) {
                setBackups(response.data.backups);
            }
        } catch (error) {
            console.error('Failed to refresh backup list:', error);
        }
    };

    const openRestoreModal = (backup: Backup) => {
        setSelectedBackup(backup);
        setConfirmationText('');
        setShowRestoreModal(true);
    };

    const closeRestoreModal = () => {
        setShowRestoreModal(false);
        setSelectedBackup(null);
        setConfirmationText('');
    };

    const handleRestore = async () => {
        if (!selectedBackup || confirmationText !== 'RESTORE DATABASE') {
            return;
        }

        setRestoring(true);
        setMessage(null);

        try {
            const response = await axios.post('/admin/database/restore', {
                backup_file: selectedBackup.path,
                confirmation: confirmationText,
            });

            if (response.data.success) {
                setMessage({ type: 'success', text: response.data.message });
                closeRestoreModal();

                // Optionally reload page after successful restore
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setMessage({ type: 'error', text: response.data.message });
            }
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || '❌ Failed to restore database. Please try again.',
            });
        } finally {
            setRestoring(false);
        }
    };

    const handleDownload = (backup: Backup) => {
        window.location.href = `/admin/database/download/${backup.filename}`;
    };

    const handleDelete = async (backup: Backup) => {
        if (!confirm(`Are you sure you want to delete this backup?\n\n${backup.filename}\nCreated: ${backup.date}`)) {
            return;
        }

        try {
            const response = await axios.delete('/admin/database/delete', {
                data: { backup_file: backup.path },
            });

            if (response.data.success) {
                setMessage({ type: 'success', text: response.data.message });
                await refreshBackupList();
            } else {
                setMessage({ type: 'error', text: response.data.message });
            }
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || '❌ Failed to delete backup.',
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Database Maintenance" />

            <div className="m-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Database Maintenance</h1>
                        <p className="mt-1 text-sm text-gray-600">Backup and restore your database</p>
                    </div>
                </div>

                {/* Message Alert */}
                {message && (
                    <div
                        className={`mb-6 rounded-lg p-4 ${
                            message.type === 'success'
                                ? 'border border-green-200 bg-green-50 text-green-800'
                                : 'border border-red-200 bg-red-50 text-red-800'
                        }`}
                    >
                        <p className="font-medium">{message.text}</p>
                    </div>
                )}

                {/* Backup Section */}
                <div className="mb-8 rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 text-xl font-semibold">Create Database Backup</h2>
                    <p className="mb-4 text-sm text-gray-600">
                        Create a complete backup of your database. This backup can be used to restore your data if needed.
                    </p>

                    <button
                        onClick={handleBackup}
                        disabled={loading}
                        className={`rounded-lg px-6 py-3 font-medium text-white transition ${
                            loading ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Creating Backup...
                            </span>
                        ) : (
                            '📦 Run Backup Now'
                        )}
                    </button>
                </div>

                {/* Backup List Section */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Available Backups</h2>
                        <button onClick={refreshBackupList} className="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300">
                            🔄 Refresh
                        </button>
                    </div>

                    {backups.length === 0 ? (
                        <p className="py-8 text-center text-gray-500">No backups available. Create your first backup above.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Filename</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Size</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Created</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {backups.map((backup) => (
                                        <tr key={backup.filename} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{backup.filename}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{backup.size}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{backup.date}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                <button
                                                    onClick={() => handleDownload(backup)}
                                                    className="mr-2 rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                                                    title="Download backup"
                                                >
                                                    ⬇️ Download
                                                </button>
                                                <button
                                                    onClick={() => openRestoreModal(backup)}
                                                    className="mr-2 rounded bg-yellow-600 px-3 py-1 text-white hover:bg-yellow-700"
                                                    title="Restore from this backup"
                                                >
                                                    ↩️ Restore
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(backup)}
                                                    className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                                                    title="Delete backup"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Restore Confirmation Modal */}
            {showRestoreModal && selectedBackup && (
                <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                    <div className="max-w-lg rounded-lg bg-white p-6 shadow-xl">
                        <h3 className="mb-4 text-xl font-bold text-red-600">⚠️ CRITICAL WARNING</h3>

                        <div className="mb-6 rounded bg-red-50 p-4 text-sm">
                            <p className="mb-2 font-semibold text-red-800">This action is IRREVERSIBLE and will:</p>
                            <ul className="ml-4 list-disc space-y-1 text-red-700">
                                <li>Completely replace your current database</li>
                                <li>Erase ALL existing data</li>
                                <li>
                                    Restore data from: <strong>{selectedBackup.filename}</strong>
                                </li>
                                <li>Create an automatic pre-restore backup</li>
                            </ul>
                        </div>

                        <p className="mb-4 text-sm text-gray-700">
                            To confirm, type <strong className="font-mono text-red-600">RESTORE DATABASE</strong> below:
                        </p>

                        <input
                            type="text"
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            placeholder="RESTORE DATABASE"
                            className="mb-6 w-full rounded border border-gray-300 px-4 py-2 font-mono focus:border-red-500 focus:outline-none"
                            disabled={restoring}
                        />

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeRestoreModal}
                                disabled={restoring}
                                className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRestore}
                                disabled={confirmationText !== 'RESTORE DATABASE' || restoring}
                                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {restoring ? 'Restoring...' : 'Restore Database'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
