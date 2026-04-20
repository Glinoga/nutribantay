import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { readExcel } from '@/utils/excel';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FileSpreadsheet, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { 
  Baby, 
  Search, 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  TrendingUp, 
  Activity,
  Filter,
  Calendar,
  Weight,
  Ruler,
  User,
  Sparkles
} from 'lucide-react';
import smartToast from '@/utils/smartToast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';

const MySwal = withReactContent(Swal);

type Child = {
    id: number;
    fullname: string;
    first_name: string;
    middle_initial?: string | null;
    last_name: string;
    sex: string;
    age: number | null;
    weight?: number | null;
    height?: number | null;
    contact_number?: string;
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

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Children Records', href: '/children' },
];

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
interface Props {
  children: Child[];
}

export default function Index({ children }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSex, setSelectedSex] = useState<string>('all');

  // Filter children based on search and sex
  const filteredChildren = useMemo(() => {
    return children.filter(child => {
      const matchesSearch = 
        child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.created_by?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSex = 
        selectedSex === 'all' || 
        child.sex === selectedSex;
      
      return matchesSearch && matchesSex;
    });
  }, [children, searchQuery, selectedSex]);

  // Calculate stats
  const stats = useMemo(() => {
    const maleCount = children.filter(c => c.sex === 'Male').length;
    const femaleCount = children.filter(c => c.sex === 'Female').length;
    
    // Calculate average BMI
    const childrenWithBMI = children.filter(c => c.weight && c.height);
    const avgBMI = childrenWithBMI.length > 0
      ? childrenWithBMI.reduce((sum, c) => {
          const bmi = c.weight! / Math.pow(c.height! / 100, 2);
          return sum + bmi;
        }, 0) / childrenWithBMI.length
      : 0;

    return {
      total: children.length,
      male: maleCount,
      female: femaleCount,
      avgBMI: avgBMI.toFixed(1)
    };
  }, [children]);

  const calculateBMI = (weight?: number, height?: number) => {
    if (!weight || !height) return null;
    return (weight / Math.pow(height / 100, 2)).toFixed(1);
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: "Underweight", color: "text-orange-600 bg-orange-100" };
    if (bmi < 25) return { text: "Normal", color: "text-green-600 bg-green-100" };
    if (bmi < 30) return { text: "Overweight", color: "text-yellow-600 bg-yellow-100" };
    return { text: "Obese", color: "text-red-600 bg-red-100" };
  };

  const handleDelete = (child: Child) => {
    MySwal.fire({
      title: 'Delete Child Record?',
      html: `
        <div style="font-family: 'Montserrat', sans-serif; text-align: center; padding: 1rem 0;">
          <div style="font-size: 1.125rem; color: hsl(181 100% 2%); margin-bottom: 1rem; font-weight: 500;">
            Are you sure you want to delete this child's record?
          </div>
          
          <div style="background: linear-gradient(135deg, hsl(0 84% 97%) 0%, hsl(0 100% 98%) 100%); 
                      border-left: 4px solid hsl(0 84% 60%); 
                      border-radius: 0.75rem; 
                      padding: 1.25rem; 
                      margin: 1.5rem 0; 
                      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);">
            <p style="color: hsl(0 84% 40%); font-size: 1rem; font-weight: 600; margin: 0 0 0.75rem 0; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <strong>${child.name}</strong>
            </p>
            <p style="color: hsl(0 84% 50%); font-size: 0.875rem; margin: 0; line-height: 1.5;">
              This action cannot be undone. All health records and data for this child will be permanently removed.
            </p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'hsl(0 84% 60%)',
      cancelButtonColor: 'hsl(142 76% 36%)',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      background: 'hsl(178 100% 98%)',
      customClass: {
        popup: 'modern-swal-delete-popup',
        confirmButton: 'modern-swal-delete-confirm-btn',
        cancelButton: 'modern-swal-delete-cancel-btn',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(`/children/${child.id}`, {
          preserveScroll: true,
          onSuccess: () => {
            smartToast.success(`${child.name}'s record deleted successfully!`);
          },
          onError: () => {
            smartToast.error('Failed to delete record. Please try again.');
          },
        });
      }
    });
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
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .child-card {
          animation: slideIn 0.5s ease-out;
        }

        .child-card:hover {
          transform: translateY(-4px);
          transition: transform 0.3s ease;
        }

        .stat-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }

        .filter-pill {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .filter-pill:hover {
          transform: scale(1.05);
        }

        .filter-pill.active {
          animation: pulse 2s ease-in-out infinite;
        }

        /* Custom scrollbar */
        .children-container::-webkit-scrollbar {
          width: 12px;
        }

        .children-container::-webkit-scrollbar-track {
          background: linear-gradient(to bottom, rgba(134, 239, 172, 0.3), rgba(52, 211, 153, 0.3));
          border-radius: 10px;
        }

        .children-container::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgb(34, 197, 94), rgb(16, 185, 129));
          border-radius: 10px;
          border: 2px solid rgba(255, 255, 255, 0.5);
        }

        .children-container::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgb(22, 163, 74), rgb(5, 150, 105));
        }

        .modern-swal-delete-popup {
          border-radius: 1.5rem !important;
          border: 3px solid hsl(0 84% 60%) !important;
          box-shadow: 0 25px 50px -12px rgba(239, 68, 68, 0.25) !important;
          font-family: 'Montserrat', sans-serif !important;
        }

        .modern-swal-delete-confirm-btn {
          border-radius: 1rem !important;
          padding: 1rem 2.5rem !important;
          font-weight: 700 !important;
          transition: all 0.3s ease !important;
        }

        .modern-swal-delete-confirm-btn:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4) !important;
        }

        .modern-swal-delete-cancel-btn {
          border-radius: 1rem !important;
          padding: 1rem 2rem !important;
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
        }

        .modern-swal-delete-cancel-btn:hover {
          transform: translateY(-2px) !important;
        }
      `}</style>

      {/* Modern Gradient Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 pb-16 pt-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(16,185,129,0.1),transparent_50%)]" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Content */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full bg-white/80 px-6 py-3 shadow-lg backdrop-blur-sm">
              <Baby className="h-6 w-6 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">Children Health Records</span>
            </div>
            
            <h1 className="mb-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              Children Registry
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Track and manage children's health and nutrition records
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="stat-card group cursor-pointer rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur-xl border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Children</p>
                  <p className="mt-2 text-3xl font-bold text-green-600">{stats.total}</p>
                </div>
                <div className="rounded-full bg-green-100 p-3 transition-transform group-hover:scale-110">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="stat-card group cursor-pointer rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Male</p>
                  <p className="mt-2 text-3xl font-bold text-blue-600">{stats.male}</p>
                </div>
                <div className="rounded-full bg-blue-100 p-3 transition-transform group-hover:scale-110">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="stat-card group cursor-pointer rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur-xl border border-pink-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Female</p>
                  <p className="mt-2 text-3xl font-bold text-pink-600">{stats.female}</p>
                </div>
                <div className="rounded-full bg-pink-100 p-3 transition-transform group-hover:scale-110">
                  <User className="h-6 w-6 text-pink-600" />
                </div>
              </div>
            </div>

            <div className="stat-card group cursor-pointer rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur-xl border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg BMI</p>
                  <p className="mt-2 text-3xl font-bold text-purple-600">{stats.avgBMI}</p>
                </div>
                <div className="rounded-full bg-purple-100 p-3 transition-transform group-hover:scale-110">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border-2 border-gray-200 bg-white/80 py-3 pl-12 pr-12 backdrop-blur-sm transition-all focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Add Child Button */}
            <Link href="/children/create">
              <Button className="group relative overflow-hidden rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                <span className="relative z-10 flex items-center gap-2 font-semibold">
                  <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                  Add New Child
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 transition-opacity group-hover:opacity-100" />
              </Button>
            </Link>
          </div>

          {/* Sex Filters */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedSex('all')}
              className={`filter-pill ${selectedSex === 'all' ? 'active' : ''} rounded-full px-6 py-2.5 font-medium shadow-md transition-all ${
                selectedSex === 'all'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                  : 'bg-white/80 text-gray-700 hover:bg-white'
              }`}
            >
              All Children
            </button>
            <button
              onClick={() => setSelectedSex('Male')}
              className={`filter-pill ${selectedSex === 'Male' ? 'active' : ''} rounded-full px-6 py-2.5 font-medium shadow-md transition-all ${
                selectedSex === 'Male'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                  : 'bg-white/80 text-gray-700 hover:bg-white'
              }`}
            >
               Male
            </button>
            <button
              onClick={() => setSelectedSex('Female')}
              className={`filter-pill ${selectedSex === 'Female' ? 'active' : ''} rounded-full px-6 py-2.5 font-medium shadow-md transition-all ${
                selectedSex === 'Female'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white'
                  : 'bg-white/80 text-gray-700 hover:bg-white'
              }`}
            >
               Female
            </button>
          </div>
        </div>
      </div>

            {/* SEARCH BAR */}
            <form onSubmit={handleSearch} className="m-4 flex gap-2">
                <input
                    type="text"
                    placeholder="Search by name, sex, or barangay..."
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

    <input
        type="number"
        name="age_min"
        placeholder="Min Age"
        className="rounded border px-3 py-2"
    />

    <input
        type="number"
        name="age_max"
        placeholder="Max Age"
        className="rounded border px-3 py-2"
    />

    <input
        type="text"
        name="barangay"
        placeholder="Barangay"
        className="rounded border px-3 py-2"
    />

    <button
        type="submit"
        className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
    >
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
                            <th className="border px-4 py-2 text-left">Weight (kg)</th>
                            <th className="border px-4 py-2 text-left">Height (cm)</th>
                            <th className="border px-4 py-2 text-left">Address</th>
                            <th className="border px-4 py-2 text-left">Contact Number</th>
                            <th className="border px-4 py-2 text-left">Contact Number</th>
                        <th className="border px-4 py-2 text-left">Created By</th>
                            <th className="border px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {children.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="p-4 text-center">
                                    No records found
                                </td>
                            </tr>
                        ) : (
                            children.map((child) => (
                                <tr key={child.id} className="hover:bg-gray-100">
                                    <td className="border px-4 py-2">{child.id}</td>
                                    <td className="border px-4 py-2">{child.fullname}</td>
                                    <td className="border px-4 py-2">{child.sex}</td>
                                    <td className="border px-4 py-2">{child.age ?? '-'}</td>
                                    <td className="border px-4 py-2">{child.weight ?? '-'}</td>
                                    <td className="border px-4 py-2">{child.height ?? '-'}</td>
                                    <td className="border px-4 py-2">{child.address ?? '-'}</td>
                                    <td className="border px-4 py-2">{child.contact_number ?? '-'}</td>
                                    <td className="border px-4 py-2">{displayPhoneNumber(child.contact_number)}</td>
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
            {pagination && pagination.last_page > 1 && (
                <div className="m-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing {pagination.from} to {pagination.to} of {pagination.total} results
                    </div>
                    <div className="flex gap-1">
                        {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => router.get('/children', { page, search: searchQuery }, { replace: true })}
                                className={`rounded px-3 py-1 ${
                                    page === pagination.current_page ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
