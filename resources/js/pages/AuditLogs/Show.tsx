import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

type AuditLog = {
    id: number;
    user_id: number | null;
    user_name: string | null;
    action: string;
    model_type: string | null;
    model_id: number | null;
    model_name: string | null;
    description: string | null;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
    ip_address: string | null;
    user_agent: string | null;
    barangay: string | null;
    created_at: string;
    user?: { id: number; name: string; email: string } | null;
};

type Props = {
    log: AuditLog;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Audit Logs',
        href: '/audit-logs',
    },
];

export default function Show({ log }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Audit Log #${log.id}`} />

            <div className="mx-auto max-w-4xl py-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Audit Log Details</h1>
                    <Link href="/audit-logs" className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">
                        Back to List
                    </Link>
                </div>

                <div className="space-y-6">
                    {/* Main Information */}
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Event Information</h2>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Timestamp</dt>
                                <dd className="mt-1 text-sm text-gray-900">{new Date(log.created_at).toLocaleString()}</dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Action</dt>
                                <dd className="mt-1">
                                    <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs leading-5 font-semibold text-blue-800">
                                        {log.action.replace(/_/g, ' ')}
                                    </span>
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">User</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {log.user ? (
                                        <>
                                            {log.user.name}
                                            <span className="text-gray-500"> ({log.user.email})</span>
                                        </>
                                    ) : (
                                        log.user_name || 'System'
                                    )}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Barangay</dt>
                                <dd className="mt-1 text-sm text-gray-900">{log.barangay || '-'}</dd>
                            </div>

                            {log.model_type && (
                                <>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Model Type</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{log.model_type}</dd>
                                    </div>

                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Model ID</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{log.model_id || '-'}</dd>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Model Name</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{log.model_name || '-'}</dd>
                                    </div>
                                </>
                            )}

                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Description</dt>
                                <dd className="mt-1 text-sm text-gray-900">{log.description || '-'}</dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">IP Address</dt>
                                <dd className="mt-1 text-sm text-gray-900">{log.ip_address || '-'}</dd>
                            </div>

                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">User Agent</dt>
                                <dd className="mt-1 text-sm break-all text-gray-900">{log.user_agent || '-'}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Old Values */}
                    {log.old_values && Object.keys(log.old_values).length > 0 && (
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Previous Values</h2>
                            <div className="rounded bg-red-50 p-4">
                                <pre className="overflow-x-auto text-sm text-gray-800">{JSON.stringify(log.old_values, null, 2)}</pre>
                            </div>
                        </div>
                    )}

                    {/* New Values */}
                    {log.new_values && Object.keys(log.new_values).length > 0 && (
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">New Values</h2>
                            <div className="rounded bg-green-50 p-4">
                                <pre className="overflow-x-auto text-sm text-gray-800">{JSON.stringify(log.new_values, null, 2)}</pre>
                            </div>
                        </div>
                    )}

                    {/* Changes Comparison */}
                    {log.old_values && log.new_values && Object.keys(log.old_values).length > 0 && Object.keys(log.new_values).length > 0 && (
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Changes</h2>
                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Field</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Old Value
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                New Value
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {Object.keys(log.new_values).map((key) => (
                                            <tr key={key} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{key}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    <span className="rounded bg-red-100 px-2 py-1">
                                                        {log.old_values?.[key] !== undefined ? String(log.old_values[key]) : '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    <span className="rounded bg-green-100 px-2 py-1">{String(log.new_values[key])}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
