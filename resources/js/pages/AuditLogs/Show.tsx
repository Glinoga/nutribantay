import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Activity, ArrowLeft, FileText, Monitor, User } from 'lucide-react';

type AuditLog = {
    id: number;
    user_id: number | null;
    user_name: string | null;
    action: string;
    model_type: string | null;
    model_id: number | null;
    model_name: string | null;
    description: string | null;
    old_values: Record<string, string | number | boolean | null> | null;
    new_values: Record<string, string | number | boolean | null> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    user?: { id: number; name: string; email: string } | null;
};

type Props = {
    log: AuditLog;
};

const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
        created: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        updated: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
        deleted: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        archived: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        restored: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
        permanently_deleted: 'bg-red-200 text-red-900 dark:bg-red-900/30 dark:text-red-400',
        maintenance_enabled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        maintenance_disabled: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        backup_created: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    };
    return colors[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
};

export default function Show({ log }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Audit Logs', href: route('audit-logs.index') },
        { title: `Log #${log.id}`, href: route('audit-logs.show', { auditLog: log.id }) },
    ];

    const oldValues = log.old_values;
    const newValues = log.new_values;
    const hasChanges = oldValues && newValues && Object.keys(oldValues).length > 0 && Object.keys(newValues).length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Audit Log #${log.id}`} />

            <div className="relative min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-cyan-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(13,148,136,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.12),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.25),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.25),transparent_50%)]" />
                <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Pill Badge */}
                    <div className="mb-6 text-center">
                        <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-teal-100/50 bg-white/90 px-6 py-3 shadow-lg backdrop-blur-sm dark:border-teal-800/50 dark:bg-gray-800/90">
                            <Activity className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getActionColor(log.action)}`}>
                                {log.action.replace(/_/g, ' ')}
                            </span>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-3xl font-bold text-transparent dark:from-teal-300 dark:via-cyan-300 dark:to-teal-300">
                                Audit Log Details
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-300">
                                Log #{log.id} â€” {new Date(log.created_at).toLocaleString()}
                            </p>
                        </div>
                        <Link
                            href={route('audit-logs.index')}
                            className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to List
                        </Link>
                    </div>

                    <div className="space-y-6">
                        {/* Event Information */}
                        <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                    Event Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-50">
                                            {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Action</dt>
                                        <dd className="mt-1">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getActionColor(
                                                    log.action,
                                                )}`}
                                            >
                                                {log.action.replace(/_/g, ' ')}
                                            </span>
                                        </dd>
                                    </div>

                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">User</dt>
                                        <dd className="mt-1 flex items-center gap-2 text-sm text-gray-900 dark:text-gray-50">
                                            <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            {log.user ? (
                                                <>
                                                    {log.user.name}
                                                    <span className="text-gray-500 dark:text-gray-400">({log.user.email})</span>
                                                </>
                                            ) : (
                                                log.user_name || 'System'
                                            )}
                                        </dd>
                                    </div>

                                    {log.model_type && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Model Type</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-50">{log.model_type}</dd>
                                        </div>
                                    )}

                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-50">{log.description || '-'}</dd>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">User Agent</dt>
                                        <dd className="mt-1 flex items-start gap-2 text-sm text-gray-900 dark:text-gray-50">
                                            <Monitor className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                                            <span className="break-all">{log.user_agent || '-'}</span>
                                        </dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>

                        {/* Changes Comparison */}
                        {hasChanges && (
                            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Activity className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                        Changes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Field</TableHead>
                                                <TableHead>Old Value</TableHead>
                                                <TableHead>New Value</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Object.keys(newValues).map((key) => (
                                                <TableRow key={key}>
                                                    <TableCell className="font-medium">{key}</TableCell>
                                                    <TableCell>
                                                        <span className="inline-block rounded bg-red-100 px-2 py-1 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                            {oldValues && oldValues[key] !== undefined ? String(oldValues[key]) : '-'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-block rounded bg-green-100 px-2 py-1 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                            {newValues[key] !== undefined ? String(newValues[key]) : '-'}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

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
            `}</style>
        </AppLayout>
    );
}
