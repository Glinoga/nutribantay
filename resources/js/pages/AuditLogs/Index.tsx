import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

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
    barangay: string | null;
    created_at: string;
    user?: { name: string } | null;
};

type Props = {
    logs: {
        data: AuditLog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: {
        action?: string;
        model_type?: string;
        user_id?: number;
        start_date?: string;
        end_date?: string;
        search?: string;
    };
    actions: string[];
    modelTypes: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Audit Logs',
        href: '/audit-logs',
    },
];

// Action badge colors
const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
        created: 'bg-green-100 text-green-800',
        updated: 'bg-blue-100 text-blue-800',
        deleted: 'bg-red-100 text-red-800',
        archived: 'bg-orange-100 text-orange-800',
        restored: 'bg-purple-100 text-purple-800',
        permanently_deleted: 'bg-red-200 text-red-900',
        maintenance_enabled: 'bg-yellow-100 text-yellow-800',
        maintenance_disabled: 'bg-green-100 text-green-800',
        backup_created: 'bg-indigo-100 text-indigo-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
};

export default function Index({ logs, filters, actions, modelTypes }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedAction, setSelectedAction] = useState(filters.action || '');
    const [selectedModel, setSelectedModel] = useState(filters.model_type || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handleFilter = () => {
        router.get(
            '/audit-logs',
            {
                search: searchTerm,
                action: selectedAction,
                model_type: selectedModel,
                start_date: startDate,
                end_date: endDate,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleReset = () => {
        setSearchTerm('');
        setSelectedAction('');
        setSelectedModel('');
        setStartDate('');
        setEndDate('');
        router.get('/audit-logs');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Logs" />

            <div className="m-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                        <p className="mt-1 text-sm text-gray-600">Track all system activities and changes</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-lg bg-white p-4 shadow">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                        {/* Search */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Search</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        {/* Action Filter */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Action</label>
                            <select
                                value={selectedAction}
                                onChange={(e) => setSelectedAction(e.target.value)}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">All Actions</option>
                                {actions.map((action) => (
                                    <option key={action} value={action}>
                                        {action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Model Type Filter */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">All Types</option>
                                {modelTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Start Date */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button onClick={handleFilter} className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                            Apply Filters
                        </button>
                        <button onClick={handleReset} className="rounded bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300">
                            Reset
                        </button>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Timestamp</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Action</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                            {log.user?.name || log.user_name || 'System'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${getActionColor(
                                                    log.action,
                                                )}`}
                                            >
                                                {log.action.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{log.model_type || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{log.description || '-'}</td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                                            <Link href={`/audit-logs/${log.id}`} className="text-blue-600 hover:text-blue-900">
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logs.last_page > 1 && (
                        <div className="border-t border-gray-200 bg-white px-4 py-3">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(logs.current_page - 1) * logs.per_page + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(logs.current_page * logs.per_page, logs.total)}</span> of{' '}
                                    <span className="font-medium">{logs.total}</span> results
                                </div>
                                <div className="flex gap-2">
                                    {logs.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`rounded border px-3 py-1 text-sm ${
                                                link.active
                                                    ? 'border-blue-500 bg-blue-500 text-white'
                                                    : link.url
                                                      ? 'border-gray-300 hover:bg-gray-50'
                                                      : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                                            }`}
                                            preserveState
                                            preserveScroll
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
