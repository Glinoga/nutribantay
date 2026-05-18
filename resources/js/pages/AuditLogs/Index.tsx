import { route } from '@/lib/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination, type PaginationData } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Activity, Download, FileText, Layers, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

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
        href: route('audit-logs.index'),
    },
];

const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
        created: 'bg-green-100 text-green-800',
        updated: 'bg-teal-100 text-teal-800',
        deleted: 'bg-red-100 text-red-800',
        archived: 'bg-orange-100 text-orange-800',
        restored: 'bg-cyan-100 text-cyan-800',
        permanently_deleted: 'bg-red-200 text-red-900',
        maintenance_enabled: 'bg-yellow-100 text-yellow-800',
        maintenance_disabled: 'bg-green-100 text-green-800',
        backup_created: 'bg-teal-100 text-teal-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
};

export default function Index({ logs, filters, actions, modelTypes }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedAction, setSelectedAction] = useState(filters.action || '');
    const [selectedModel, setSelectedModel] = useState(filters.model_type || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const stats = useMemo(() => {
        const uniqueActions = new Set(logs.data.map((l) => l.action));
        const uniqueModels = new Set(logs.data.map((l) => l.model_type).filter(Boolean));
        const activeUsers = new Set(logs.data.map((l) => l.user_id).filter(Boolean));
        return {
            totalEntries: logs.total,
            uniqueActions: uniqueActions.size,
            modelsTracked: uniqueModels.size,
            activeUsers: activeUsers.size,
        };
    }, [logs]);

    const pagination: PaginationData = {
        current_page: logs.current_page,
        last_page: logs.last_page,
        from: logs.data.length > 0 ? (logs.current_page - 1) * logs.per_page + 1 : null,
        to: logs.data.length > 0 ? Math.min(logs.current_page * logs.per_page, logs.total) : null,
        total: logs.total,
    };

    const handleFilter = () => {
        router.get(
            route('audit-logs.index'),
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
        router.get(route('audit-logs.index'));
    };

    const handlePageChange = (page: number) => {
        router.get(
            route('audit-logs.index'),
            {
                page,
                search: searchTerm || undefined,
                action: selectedAction || undefined,
                model_type: selectedModel || undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedAction) params.append('action', selectedAction);
        if (selectedModel) params.append('model_type', selectedModel);
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        window.location.href = `${route('audit-logs.export')}?${params.toString()}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Logs" />

            <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-cyan-50/50">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(13,148,136,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.12),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Pill Badge */}
                    <div className="mb-6 pt-8 text-center">
                        <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-teal-100/50 bg-white/90 px-6 py-3 shadow-lg backdrop-blur-sm">
                            <Activity className="h-6 w-6 text-teal-600" />
                            <span className="text-sm font-semibold text-teal-700">Audit Trail</span>
                        </div>
                    </div>

                    {/* Glassmorphic Header Card */}
                    <div className="relative mb-8 text-center">
                        <div className="relative mx-auto max-w-2xl rounded-3xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                            <div className="flex items-center justify-center gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 opacity-50 blur-lg" />
                                    <div className="relative rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 p-4 shadow-lg">
                                        <Activity className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                                        Audit Logs
                                    </h1>
                                    <p className="mt-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                                        <Search className="h-4 w-4" />
                                        Track all system activities and changes
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
                                    <p className="text-xs font-medium text-gray-500">Total Entries</p>
                                    <p className="mt-1 text-2xl font-bold text-teal-600">{stats.totalEntries}</p>
                                </div>
                                <div className="rounded-full bg-teal-50 p-2.5">
                                    <FileText className="h-5 w-5 text-teal-500" />
                                </div>
                            </div>
                        </div>
                        <div className="stat-card rounded-xl border border-cyan-100/50 bg-white dark:bg-gray-800/80 p-4 shadow-md transition-all hover:border-cyan-200 hover:shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Unique Actions</p>
                                    <p className="mt-1 text-2xl font-bold text-cyan-600">{stats.uniqueActions}</p>
                                </div>
                                <div className="rounded-full bg-cyan-50 p-2.5">
                                    <Activity className="h-5 w-5 text-cyan-500" />
                                </div>
                            </div>
                        </div>
                        <div className="stat-card rounded-xl border border-green-100/50 bg-white dark:bg-gray-800/80 p-4 shadow-md transition-all hover:border-green-200 hover:shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Models Tracked</p>
                                    <p className="mt-1 text-2xl font-bold text-green-600">{stats.modelsTracked}</p>
                                </div>
                                <div className="rounded-full bg-green-50 p-2.5">
                                    <Layers className="h-5 w-5 text-green-500" />
                                </div>
                            </div>
                        </div>
                        <div className="stat-card rounded-xl border border-teal-100/50 bg-white dark:bg-gray-800/80 p-4 shadow-md transition-all hover:border-teal-200 hover:shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Active Users</p>
                                    <p className="mt-1 text-2xl font-bold text-teal-600">{stats.activeUsers}</p>
                                </div>
                                <div className="rounded-full bg-teal-50 p-2.5">
                                    <Users className="h-5 w-5 text-teal-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6 border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Search</label>
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search..."
                                            className="w-full rounded-md border py-2.5 pr-3 pl-10 transition-all outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Action</label>
                                    <select
                                        value={selectedAction}
                                        onChange={(e) => setSelectedAction(e.target.value)}
                                        className="w-full rounded-md border px-3 py-2.5 text-sm transition-all outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                                    >
                                        <option value="">All Actions</option>
                                        {actions.map((action) => (
                                            <option key={action} value={action}>
                                                {action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                                    <select
                                        value={selectedModel}
                                        onChange={(e) => setSelectedModel(e.target.value)}
                                        className="w-full rounded-md border px-3 py-2.5 text-sm transition-all outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                                    >
                                        <option value="">All Types</option>
                                        {modelTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full rounded-md border px-3 py-2.5 text-sm transition-all outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">End Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full rounded-md border px-3 py-2.5 text-sm transition-all outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleFilter}
                                        className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md transition-all duration-300 hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg"
                                    >
                                        <Search className="mr-2 h-4 w-4" />
                                        Apply Filters
                                    </Button>
                                    <Button onClick={handleReset} variant="outline" className="border hover:bg-gray-100 dark:hover:bg-gray-700">
                                        Reset
                                    </Button>
                                </div>
                                <Button
                                    onClick={handleExport}
                                    variant="outline"
                                    className="border hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export CSV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logs Table */}
                    <Card className="mb-8 border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                        <CardContent className="p-0">
                            {logs.data.length > 0 ? (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Timestamp</TableHead>
                                                <TableHead>User</TableHead>
                                                <TableHead>Action</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {logs.data.map((log) => (
                                                <TableRow key={log.id}>
                                                    <TableCell className="font-medium">
                                                        {new Date(log.created_at).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>{log.user?.name || log.user_name || 'System'}</TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getActionColor(
                                                                log.action,
                                                            )}`}
                                                        >
                                                            {log.action.replace(/_/g, ' ')}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>{log.model_type || '-'}</TableCell>
                                                    <TableCell className="max-w-xs truncate">{log.description || '-'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Link
                                                            href={route('audit-logs.show', { auditLog: log.id })}
                                                            className="text-sm font-medium text-teal-600 hover:text-teal-800"
                                                        >
                                                            View Details
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <Pagination pagination={pagination} onPageChange={handlePageChange} />
                                </>
                            ) : (
                                <div className="flex min-h-[400px] flex-col items-center justify-center p-12">
                                    <div className="mb-6 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 p-8">
                                        <Activity className="h-16 w-16 text-teal-600" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-gray-900">No audit logs found</h3>
                                    <p className="max-w-md text-center text-gray-600">
                                        {searchTerm || selectedAction || selectedModel || startDate || endDate
                                            ? 'Try adjusting your filters to find what you\'re looking for.'
                                            : 'There are no audit log entries recorded yet.'}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
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
