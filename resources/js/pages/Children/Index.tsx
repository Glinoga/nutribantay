import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

type Child = {
    id: number;
    fullname: string;
    first_name: string;
    middle_initial?: string | null;
    last_name: string;
    sex: string;
    age: number | null;
    is_over_60_months: boolean;
    weight?: number | null;
    height?: number | null;
    address?: string | null;
    contact_number?: string | null;
    barangay?: string | null;
    creator?: { name: string | null };
};

type Pagination = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
};

type IndexProps = {
    children: Child[];
    pagination?: Pagination;
    search?: string;
    flash?: { success?: string };
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Children Records', href: '/children' }];

type AuthProps = {
    auth?: {
        user?: { id: number; name: string; email: string; barangay?: string };
        roles?: string[];
    };
};

export default function Index({ children, pagination, search = '', flash }: IndexProps) {
    const { auth } = usePage<AuthProps>().props;
    const [searchQuery, setSearchQuery] = useState(search);

    const roles = auth?.roles ?? [];
    const isHealthworker = roles.includes('Healthworker');
    const canManageChildren = isHealthworker;

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [importData, setImportData] = useState<any[]>([]);
    const [isImporting, setIsImporting] = useState(false);

    // Reset modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedFile(null);
        setPreviewData([]);
        setImportData([]);
    };

    // Pagination state
    const [jumpToPage, setJumpToPage] = useState('');

    const handleJumpToPage = (e: React.FormEvent) => {
        e.preventDefault();
        const page = parseInt(jumpToPage);
        if (page >= 1 && page <= (pagination?.last_page || 1)) {
            router.get('/children', { page, search: searchQuery }, { replace: true });
            setJumpToPage('');
        }
    };

    // Handle file selection in modal
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);

        try {
            const rawData = await readExcel(file);
            if (!rawData || rawData.length === 0) {
                alert('Excel file is empty or not readable');
                return;
            }

            setPreviewData(rawData.slice(0, 10)); // First 10 rows
            setImportData(rawData); // All data for import
        } catch (err) {
            console.error('Error reading file:', err);
            alert('Failed to read Excel file');
        }
    };

    // Handle actual import
    const handleConfirmImport = () => {
        if (importData.length === 0) return;

        setIsImporting(true);

        router.post(
            '/children/import',
            { data: importData },
            {
                onSuccess: () => {
                    setIsImporting(false);
                    closeModal();
                    // Show alert and manually reload
                    alert('Import complete! Children imported successfully.');
                    window.location.reload();
                },
                onError: () => {
                    setIsImporting(false);
                    alert('Import failed');
                },
            },
        );
    };

    // Open modal and reset
    const openImportModal = () => {
        setSelectedFile(null);
        setPreviewData([]);
        setImportData([]);
        setIsModalOpen(true);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/children', { search: searchQuery }, { replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Children Records" />

            {/* HEADER */}
            <div className="m-4 mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">Children Records</h1>

                <div className="flex gap-2">
                    {/* 🔥 FIXED INPUT */}
                    {canManageChildren && (
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogTrigger asChild>
                                <button onClick={openImportModal} className="cursor-pointer rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
                                    Upload Excel
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Import Children from Excel</DialogTitle>
                                    <DialogDescription>
                                        Upload an Excel file (.xlsx or .xls) with child records. Preview will be shown before importing.
                                    </DialogDescription>
                                </DialogHeader>

                                {!selectedFile ? (
                                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12">
                                        <Upload className="mb-4 h-12 w-12 text-gray-400" />
                                        <p className="mb-4 text-gray-600">Click to select an Excel file</p>
                                        <label className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                                            Select File
                                            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileSelect} />
                                        </label>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileSpreadsheet className="h-6 w-6 text-green-600" />
                                                <div>
                                                    <p className="font-medium">{selectedFile.name}</p>
                                                    <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setSelectedFile(null)} className="rounded p-2 hover:bg-gray-100">
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>

                                        {previewData.length > 0 && (
                                            <div className="mb-4">
                                                <p className="mb-2 font-medium">Preview ({importData.length} total rows):</p>
                                                <div className="max-h-60 overflow-x-auto overflow-y-auto rounded-lg border">
                                                    <table className="min-w-full text-sm">
                                                        <thead className="sticky top-0 bg-gray-50">
                                                            <tr>
                                                                <th className="border px-2 py-1 text-left">Full Name</th>
                                                                <th className="border px-2 py-1 text-left">Sex</th>
                                                                <th className="border px-2 py-1 text-left">Birthdate</th>
                                                                <th className="border px-2 py-1 text-left">Weight</th>
                                                                <th className="border px-2 py-1 text-left">Height</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {previewData.map((row, i) => (
                                                                <tr key={i} className="hover:bg-gray-50">
                                                                    <td className="border px-2 py-1">{row.fullName || '-'}</td>
                                                                    <td className="border px-2 py-1">{row.sex || '-'}</td>
                                                                    <td className="border px-2 py-1">{row.birthdate || '-'}</td>
                                                                    <td className="border px-2 py-1">{row.weight || '-'}</td>
                                                                    <td className="border px-2 py-1">{row.height || '-'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setSelectedFile(null)} className="rounded border px-4 py-2 hover:bg-gray-50">
                                                Choose Different File
                                            </button>
                                            <button
                                                onClick={handleConfirmImport}
                                                disabled={isImporting || importData.length === 0}
                                                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {isImporting ? 'Importing...' : `Import ${importData.length} Records`}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* ADD CHILD */}
                    {canManageChildren && (
                        <Link href="/children/create" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                            Add Child
                        </Link>
                    )}
                </div>
            </div>

            {/* SEARCH BAR */}
            <form onSubmit={handleSearch} className="m-4 flex gap-2">
                <input
                    type="text"
                    placeholder="Search by name or sex..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 rounded border px-4 py-2"
                />
                <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Search
                </button>
                {search && (
                    <button
                        type="button"
                        onClick={() => {
                            setSearchQuery('');
                            router.get('/children', {}, { replace: true });
                        }}
                        className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
                    >
                        Clear
                    </button>
                )}
            </form>

            {/* EXPORT FILTERS */}
            <form method="GET" action="/children/export" className="m-4 flex gap-2">
                <input type="number" name="age_min" placeholder="Min Age" className="rounded border px-3 py-2" />

                <input type="number" name="age_max" placeholder="Max Age" className="rounded border px-3 py-2" />

                <button type="submit" className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                    Export CSV
                </button>
            </form>

            {/* FLASH MESSAGE */}
            {flash?.success && <div className="mx-4 mb-4 rounded bg-green-100 p-4 text-green-800">{flash.success}</div>}

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="min-w-full overflow-hidden rounded border">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="border px-4 py-2 text-left">ID</th>
                            <th className="border px-4 py-2 text-left">Full Name</th>
                            <th className="border px-4 py-2 text-left">Sex</th>
                            <th className="border px-4 py-2 text-left">Age</th>
                            <th className="border px-4 py-2 text-left">Created By</th>
                            <th className="border px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {children.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-4 text-center">
                                    No records found
                                </td>
                            </tr>
                        ) : (
                            children.map((child) => (
                                <tr key={child.id} className="hover:bg-gray-100">
                                    <td className="border px-4 py-2">{child.id}</td>
                                    <td className="border px-4 py-2">{child.fullname}</td>
                                    <td className="border px-4 py-2">{child.sex}</td>
                                    <td className="border px-4 py-2">
                                        {child.age ?? '-'}
                                        {child.is_over_60_months && (
                                            <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
                                                60+
                                            </span>
                                        )}
                                    </td>
                                    <td className="border px-4 py-2">{child.creator?.name ?? 'N/A'}</td>
                                    <td className="border px-4 py-2">
                                        <div className="flex gap-1">
                                            <Link href={`/children/${child.id}`} className="rounded bg-blue-500 px-2 py-1 text-xs text-white">
                                                View
                                            </Link>
                                            {canManageChildren && (
                                                <>
                                                    <Link
                                                        href={`/children/${child.id}/edit`}
                                                        className="rounded bg-green-500 px-2 py-1 text-xs text-white"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Delete child profile?')) {
                                                                router.delete(`/children/${child.id}`);
                                                            }
                                                        }}
                                                        className="rounded bg-red-500 px-2 py-1 text-xs text-white"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            {pagination && pagination.last_page >= 1 && (
                <div className="m-4 flex items-center justify-between">
                    {/* Results count */}
                    <div className="text-sm text-gray-600">
                        Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total || 0} children
                    </div>

                    {/* Page navigation */}
                    <div className="flex items-center gap-2">
                        {/* Page counter */}
                        <span className="text-sm text-gray-600">
                            Page {pagination.current_page} of {pagination.last_page}
                        </span>

                        {/* Previous button */}
                        <button
                            onClick={() => router.get('/children', { page: pagination.current_page - 1, search: searchQuery }, { replace: true })}
                            disabled={pagination.current_page <= 1}
                            className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Back
                        </button>

                        {/* Next button */}
                        <button
                            onClick={() => router.get('/children', { page: pagination.current_page + 1, search: searchQuery }, { replace: true })}
                            disabled={pagination.current_page >= pagination.last_page}
                            className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>

                        {/* Jump to page input */}
                        <form onSubmit={handleJumpToPage} className="flex items-center gap-1">
                            <input
                                type="number"
                                min="1"
                                max={pagination.last_page}
                                value={jumpToPage}
                                onChange={(e) => setJumpToPage(e.target.value)}
                                placeholder="#"
                                className="w-16 rounded border px-2 py-1"
                            />
                            <button type="submit" className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700">
                                Go
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
