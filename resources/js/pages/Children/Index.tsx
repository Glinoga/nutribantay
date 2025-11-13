import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
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
  uid: string;
  name: string;
  sex: string;
  age: number;
  weight?: number;
  height?: number;
  created_by?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Children Records', href: '/children' },
];

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

      {/* Children Grid */}
      <div className="children-container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {filteredChildren.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredChildren.map((child, index) => {
              const bmi = calculateBMI(child.weight, child.height);
              const bmiStatus = bmi ? getBMIStatus(Number(bmi)) : null;

              return (
                <div
                  key={child.id}
                  className="child-card group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:shadow-2xl"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Color Accent based on sex */}
                  <div 
                    className={`absolute inset-x-0 top-0 h-1.5 ${
                      child.sex === 'Male' ? 'bg-blue-500' : 'bg-pink-500'
                    }`}
                  />

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Header */}
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-green-600">
                          {child.name}
                        </h3>
                        <p className="text-sm text-gray-500">ID: {child.uid}</p>
                      </div>
                      <div className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        child.sex === 'Male' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-pink-100 text-pink-700'
                      }`}>
                        {child.sex === 'Male' ? 'Male' : 'Female'}
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="mb-4 grid grid-cols-3 gap-3">
                      <div className="rounded-lg bg-gray-50 p-3 text-center">
                        <Calendar className="mx-auto mb-1 h-4 w-4 text-gray-500" />
                        <p className="text-xs text-gray-500">Age</p>
                        <p className="font-bold text-gray-900">{child.age}</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3 text-center">
                        <Weight className="mx-auto mb-1 h-4 w-4 text-gray-500" />
                        <p className="text-xs text-gray-500">Weight</p>
                        <p className="font-bold text-gray-900">{child.weight ? `${child.weight}kg` : '-'}</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3 text-center">
                        <Ruler className="mx-auto mb-1 h-4 w-4 text-gray-500" />
                        <p className="text-xs text-gray-500">Height</p>
                        <p className="font-bold text-gray-900">{child.height ? `${child.height}cm` : '-'}</p>
                      </div>
                    </div>

                    {/* BMI Status */}
                    {bmi && bmiStatus && (
                      <div className={`mb-4 rounded-lg p-3 ${bmiStatus.color}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">BMI: {bmi}</span>
                          <span className="text-xs font-medium">{bmiStatus.text}</span>
                        </div>
                      </div>
                    )}

                    {/* Created By */}
                    {child.created_by && (
                      <p className="mb-4 text-xs text-gray-500">
                        Created by: <span className="font-medium text-gray-700">{child.created_by}</span>
                      </p>
                    )}

                    {/* Divider */}
                    <div className="mb-4 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Link
                        href={`/children/${child.id}/edit`}
                        className="flex-1"
                      >
                        <Button className="group/btn w-full bg-green-600 text-white transition-all hover:bg-green-700 hover:shadow-lg" size="sm">
                          <Edit2 className="mr-2 h-4 w-4 transition-transform group-hover/btn:rotate-12" />
                          Edit
                        </Button>
                      </Link>

                      <Button
                        className="group/btn flex-1 bg-red-600 text-white transition-all hover:bg-red-700 hover:shadow-lg"
                        size="sm"
                        onClick={() => handleDelete(child)}
                      >
                        <Trash2 className="mr-2 h-4 w-4 transition-transform group-hover/btn:scale-110" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-white/80 p-12 backdrop-blur-sm">
            <div className="mb-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 p-8">
              <Sparkles className="h-16 w-16 text-green-600" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900">
              {searchQuery || selectedSex !== 'all' ? 'No matching records' : 'No children registered yet'}
            </h3>
            <p className="mb-6 max-w-md text-center text-gray-600">
              {searchQuery || selectedSex !== 'all' 
                ? 'Try adjusting your search or filter to find what you\'re looking for.'
                : 'Get started by registering your first child to begin tracking health records.'}
            </p>
            {!searchQuery && selectedSex === 'all' && (
              <Link href="/children/create">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                  <Plus className="mr-2 h-5 w-5" />
                  Register First Child
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
