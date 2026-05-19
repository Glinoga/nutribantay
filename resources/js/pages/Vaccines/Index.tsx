import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Calendar, Clock, Edit2, Plus, Search, Shield, Sparkles, Syringe, Trash2, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MySwal, swalTheme } from '@/utils/sweetAlertConfig';

type Vaccine = {
    id: number;
    name: string;
    description: string | null;
    children_count: number;
    created_by: string | null;
    created_at: string;
};

type Stats = {
    total: number;
    total_children: number;
    most_popular: string | null;
    most_popular_count: number;
    recently_added: number;
};

type IndexProps = {
    vaccines: Vaccine[];
    stats: Stats;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Vaccines', href: route('vaccines.index') }];

export default function Index({ vaccines, stats }: IndexProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingVaccine, setEditingVaccine] = useState<Vaccine | null>(null);
    const [search, setSearch] = useState('');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    const flash = usePage<{ flash?: { success?: string } }>().props.flash;

    const filteredVaccines = vaccines.filter(
        (v) => v.name.toLowerCase().includes(search.toLowerCase()) || (v.description ?? '').toLowerCase().includes(search.toLowerCase()),
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingVaccine) {
            put(route('vaccines.update', { vaccine: editingVaccine.id }), {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingVaccine(null);
                    reset();
                },
            });
        } else {
            post(route('vaccines.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const openEdit = (vaccine: Vaccine) => {
        setEditingVaccine(vaccine);
        setData('name', vaccine.name);
        setData('description', vaccine.description ?? '');
        setShowModal(true);
    };

    const openCreate = () => {
        setEditingVaccine(null);
        reset();
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingVaccine(null);
        reset();
    };

    const handleDelete = (vaccine: Vaccine) => {
        MySwal.fire({
            ...swalTheme(),
            title: `Remove "${vaccine.name}"?`,
            html: `
                <div style="font-family: 'Montserrat', sans-serif; text-align: center; padding: 1rem 0;">
                    <p style="font-size: 0.875rem; color: hsl(0 84% 50%); margin: 0; line-height: 1.5;">
                        This action cannot be undone. All child associations will be removed.
                    </p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'hsl(0 84% 60%)',
            cancelButtonColor: 'hsl(142 76% 36%)',
            confirmButtonText: 'Yes, remove it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('vaccines.destroy', { vaccine: vaccine.id }));
            }
        });
    };

    useEffect(() => {
        if (!showModal) {
            setEditingVaccine(null);
            reset();
        }
    }, [showModal, reset]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vaccine Catalog" />

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

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .vaccine-card {
                    animation: slideIn 0.4s ease-out forwards;
                    opacity: 0;
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

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.12),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.25),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.25),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Pill Badge */}
                    <div className="mb-6 pt-8 text-center">
                        <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-teal-100/50 bg-white/90 px-6 py-3 shadow-lg backdrop-blur-sm dark:border-teal-800/50 dark:bg-gray-800/90">
                            <Shield className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                            <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">Vaccine Catalog</span>
                        </div>
                    </div>

                    {/* Glassmorphic Header Card */}
                    <div className="relative mb-8 text-center">
                        <div className="relative mx-auto max-w-2xl rounded-3xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                            <div className="flex items-center justify-center gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 opacity-50 blur-lg"></div>
                                    <div className="relative rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 p-4 shadow-lg">
                                        <Shield className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl dark:from-teal-300 dark:via-cyan-300 dark:to-teal-300">
                                        Manage Vaccines
                                    </h1>
                                    <p className="mt-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                                        <Sparkles className="h-4 w-4" />
                                        Manage available vaccines for child vaccination tracking and immunization records
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                        <div className="stat-card cursor-pointer rounded-xl border border-teal-100/50 bg-white dark:bg-gray-800/80 p-4 shadow-md transition-all hover:border-teal-200 hover:shadow-lg dark:border-teal-800/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Vaccines</p>
                                    <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{stats.total}</p>
                                </div>
                                <div className="rounded-full bg-teal-50 p-2.5 dark:bg-teal-900/30">
                                    <Syringe className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card cursor-pointer rounded-xl border border-blue-100/50 bg-white dark:bg-gray-800/80 p-4 shadow-md transition-all hover:border-blue-200 hover:shadow-lg dark:border-blue-800/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Children Vaccinated</p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total_children}</p>
                                </div>
                                <div className="rounded-full bg-blue-50 p-2.5 dark:bg-blue-900/30">
                                    <Users className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card cursor-pointer rounded-xl border border-purple-100/50 bg-white dark:bg-gray-800/80 p-4 shadow-md transition-all hover:border-purple-200 hover:shadow-lg dark:border-purple-800/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Most Popular</p>
                                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.most_popular ?? '-'}</p>
                                    {stats.most_popular_count > 0 && <p className="text-xs text-gray-500 dark:text-gray-400">{stats.most_popular_count} children</p>}
                                </div>
                                <div className="rounded-full bg-purple-50 p-2.5 dark:bg-purple-900/30">
                                    <Shield className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card cursor-pointer rounded-xl border border-green-100/50 bg-white dark:bg-gray-800/80 p-4 shadow-md transition-all hover:border-green-200 hover:shadow-lg dark:border-green-800/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Recently Added</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.recently_added}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Last 30 days</p>
                                </div>
                                <div className="rounded-full bg-green-50 p-2.5 dark:bg-green-900/30">
                                    <Clock className="h-5 w-5 text-green-500 dark:text-green-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {flash?.success && (
                        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">{flash.success}</div>
                    )}

                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative max-w-md flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search vaccines by name or description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-md border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 py-2.5 pr-10 pl-10 text-sm shadow-sm transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <Button
                            onClick={openCreate}
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 text-sm shadow-md hover:from-teal-600 hover:to-cyan-600"
                        >
                            <Plus className="mr-1.5 h-4 w-4" />
                            Add Vaccine
                        </Button>
                    </div>

                    {filteredVaccines.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
                                <Syringe className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{search ? 'No vaccines match your search.' : 'No vaccines yet'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {search ? 'Try adjusting your search terms.' : 'Add a vaccine using the button above to get started.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredVaccines.map((vaccine, index) => (
                                <div key={vaccine.id} className="vaccine-card group" style={{ animationDelay: `${index * 50}ms` }}>
                                    <div className="h-full rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-xl dark:bg-gray-800">
                                        <div className="p-4">
                                            <div className="mb-3 flex items-start gap-3">
                                                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 text-sm font-bold shadow-sm dark:from-teal-800 dark:to-cyan-800">
                                                    <Syringe className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-bold text-gray-900 dark:text-gray-100">{vaccine.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {vaccine.id}</p>
                                                </div>
                                            </div>

                                            {vaccine.description && <p className="mb-3 line-clamp-2 text-xs text-gray-600 dark:text-gray-300">{vaccine.description}</p>}

                                            <div className="mb-3 flex items-center gap-2">
                                                <Badge className="bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400">
                                                    <Users className="mr-1 h-3 w-3" />
                                                    {vaccine.children_count} {vaccine.children_count === 1 ? 'child' : 'children'}
                                                </Badge>
                                            </div>

                                            <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                                                    <span className="truncate">{vaccine.created_by ?? 'Unknown'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex border-t border-gray-100 dark:border-gray-700">
                                            <button
                                                onClick={() => openEdit(vaccine)}
                                                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-teal-600 transition-colors hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(vaccine)}
                                                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 border-l border-gray-100 py-2.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-gray-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={showModal} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{editingVaccine ? 'Edit Vaccine' : 'Add Vaccine'}</DialogTitle>
                        <DialogDescription>
                            {editingVaccine ? 'Update the vaccine details below.' : 'Add a new vaccine to the catalog.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="vaccine-name" className="dark:text-gray-300">Vaccine Name</Label>
                            <Input
                                id="vaccine-name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g., BCG, Pentavalent, Measles"
                                className={`dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 ${errors.name ? 'border-red-500' : ''}`}
                            />
                            {errors.name && <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vaccine-description" className="dark:text-gray-300">Description (optional)</Label>
                            <Textarea
                                id="vaccine-description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Optional description of the vaccine..."
                                rows={3}
                                className={`dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 ${errors.description ? 'border-red-500' : ''}`}
                            />
                            {errors.description && <p className="text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
                        </div>

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : editingVaccine ? 'Update' : 'Add Vaccine'}
                            </Button>
                            <Button type="button" variant="outline" onClick={closeModal}>
                                Cancel
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
