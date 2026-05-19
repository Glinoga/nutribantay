import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import { MySwal, swalTheme } from '@/utils/sweetAlertConfig';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Pill, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

type Vitamin = {
    id: number;
    name: string;
};

type Dose = {
    id: number;
    dose_number: number;
    date_given: string | null;
    next_due_date: string | null;
    remarks: string | null;
    dose_status: string;
    administered_by: string | null;
};

type ChildVitamin = {
    id: number;
    vitamin: Vitamin;
    progress: {
        completed: number;
        total: number;
        status: string;
    };
    doses: Dose[];
};

type ChildVitaminsProps = {
    child: {
        id: number;
        slug?: string;
        fullname: string;
    };
    child_vitamins: ChildVitamin[];
    available_vitamins: Vitamin[];
};

const getDoseBadgeClass = (status: string) => {
    switch (status) {
        case 'Completed':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'Overdue':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        default:
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
};

const getProgressBadgeClass = (status: string) => {
    switch (status) {
        case 'Completed':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'In Progress':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Children Records', href: route('children.index') }];

export default function Vitamins({ child, child_vitamins, available_vitamins }: ChildVitaminsProps) {
    const [selectedVitaminId, setSelectedVitaminId] = useState<number | null>(null);
    const [recordingDoseFor, setRecordingDoseFor] = useState<ChildVitamin | null>(null);
    const [editingDose, setEditingDose] = useState<{ cv: ChildVitamin; dose: Dose } | null>(null);
    const [administeredChoice, setAdministeredChoice] = useState<'yes' | 'no' | null>(null);
    const errors = usePage<{ errors: Record<string, string> }>().props.errors;

    const doseForm = useForm({
        dose_number: '',
        date_given: '',
        next_due_date: '',
        remarks: '',
    });

    const handleAddVitamin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVitaminId) return;

        router.post(route('children.vitamins.store', { child: child.slug }), {
            vitamin_id: selectedVitaminId,
        });
    };

    const openRecordDose = (cv: ChildVitamin) => {
        const pendingDose = cv.doses.find((dose) => !dose.date_given);

        if (pendingDose) {
            openEditDose(cv, pendingDose);
        } else {
            const nextDose = cv.doses.length + 1;
            setRecordingDoseFor(cv);
            setEditingDose(null);
            setAdministeredChoice(null);
            doseForm.reset();
            doseForm.setData('dose_number', String(nextDose));
        }
    };

    const openEditDose = (cv: ChildVitamin, dose: Dose) => {
        setEditingDose({ cv, dose });
        setRecordingDoseFor(null);
        setAdministeredChoice('yes');
        doseForm.setData({
            dose_number: String(dose.dose_number),
            date_given: dose.date_given ?? '',
            next_due_date: dose.next_due_date ?? '',
            remarks: dose.remarks ?? '',
        });
    };

    const handleAdministeredChange = (choice: 'yes' | 'no') => {
        setAdministeredChoice(choice);
        if (choice === 'yes') {
            doseForm.setData('date_given', getTodayDate());
            doseForm.setData('next_due_date', '');
        } else {
            doseForm.setData('date_given', '');
            doseForm.setData('next_due_date', '');
        }
    };

    const submitDose = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            date_given: administeredChoice === 'no' ? null : doseForm.data.date_given || null,
            next_due_date: doseForm.data.next_due_date || null,
            remarks: doseForm.data.remarks || null,
        };

        if (editingDose) {
            router.patch(
                route('children.vitamins.doses.update', { child: child.id, childVitamin: editingDose.cv.id, dose: editingDose.dose.id }),
                payload,
                {
                    preserveScroll: true,
                    onSuccess: () => closeDoseModal(),
                },
            );
        } else if (recordingDoseFor) {
            router.post(
                route('children.vitamins.doses.store', { child: child.id, childVitamin: recordingDoseFor.id }),
                {
                    ...payload,
                    dose_number: Number(doseForm.data.dose_number),
                },
                {
                    preserveScroll: true,
                    onSuccess: () => closeDoseModal(),
                },
            );
        }
    };

    const closeDoseModal = () => {
        setRecordingDoseFor(null);
        setEditingDose(null);
        setAdministeredChoice(null);
        doseForm.reset();
    };

    const handleDeleteVitamin = (cv: ChildVitamin) => {
        MySwal.fire({
            ...swalTheme(),
            title: `Remove ${cv.vitamin.name}?`,
            text: 'All dose records will be deleted. This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0891B2',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove it!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('children.vitamins.destroy', { child: child.id, childVitamin: cv.id }));
            }
        });
    };

    const handleDeleteDose = (cv: ChildVitamin, dose: Dose) => {
        MySwal.fire({
            ...swalTheme(),
            title: 'Delete Dose Record?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0891B2',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('children.vitamins.doses.destroy', { child: child.id, childVitamin: cv.id, dose: dose.id }));
            }
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                ...breadcrumbs,
                { title: child.fullname, href: route('children.show', { child: child.slug }) },
                { title: 'Vitamins', href: route('children.vitamins.index', { child: child.slug }) },
            ]}
        >
            <Head title={`Vitamins - ${child.fullname}`} />

            <style>{`
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

                .fade-in-up {
                    animation: fadeInUp 0.4s ease-out forwards;
                    opacity: 0;
                }

                .vitamin-card {
                    animation: fadeInUp 0.5s ease-out forwards;
                    opacity: 0;
                }

                .vitamin-card:nth-child(1) { animation-delay: 0.1s; }
                .vitamin-card:nth-child(2) { animation-delay: 0.2s; }
                .vitamin-card:nth-child(3) { animation-delay: 0.3s; }
                .vitamin-card:nth-child(4) { animation-delay: 0.4s; }
                .vitamin-card:nth-child(5) { animation-delay: 0.5s; }

                .action-btn {
                    transition: all 0.2s ease;
                }

                .action-btn:hover {
                    transform: scale(1.05);
                }
            `}</style>

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.12),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.25),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.25),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="fade-in-up mb-6 text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-100/50 bg-white/90 px-5 py-2 shadow-lg backdrop-blur-sm dark:border-teal-800/50 dark:bg-gray-800/90">
                            <Pill className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                            <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">Vitamin Tracker</span>
                        </div>

                        <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl dark:text-gray-50">
                            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent dark:from-teal-300 dark:via-cyan-300 dark:to-teal-300">
                                {child.fullname}
                            </span>
                        </h1>
                        <p className="mx-auto max-w-xl text-gray-600 dark:text-gray-300">
                            Track and manage supplementation records for {child.fullname}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="fade-in-up mb-6 flex flex-wrap gap-3" style={{ animationDelay: '0.2s' }}>
                        <Link href={route('children.show', { child: child.slug })}>
                            <button className="action-btn inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg">
                                <X className="h-4 w-4" />
                                Back to Child
                            </button>
                        </Link>

                        <Link href={route('children.index')}>
                            <button className="action-btn inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                                <X className="h-4 w-4" />
                                Back to List
                            </button>
                        </Link>
                    </div>

                    {/* Add Vitamin Section */}
                    {available_vitamins.length > 0 && (
                        <div
                            className="fade-in-up mb-6 rounded-xl border-0 bg-white p-6 shadow-md transition-all hover:shadow-lg dark:bg-gray-800"
                            style={{ animationDelay: '0.3s' }}
                        >
                            <div className="mb-4 flex items-center gap-2">
                                <Plus className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Add Vitamin to Child</h2>
                            </div>
                            <form onSubmit={handleAddVitamin} className="flex gap-3">
                                <Select
                                    value={selectedVitaminId ? String(selectedVitaminId) : ''}
                                    onValueChange={(val) => setSelectedVitaminId(Number(val))}
                                >
                                    <SelectTrigger className="flex-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                                        <SelectValue placeholder="Select a vitamin..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {available_vitamins.map((v) => (
                                            <SelectItem key={v.id} value={String(v.id)}>
                                                {v.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    type="submit"
                                    disabled={!selectedVitaminId}
                                    className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Vitamin
                                </Button>
                            </form>
                        </div>
                    )}

                    {/* Vitamin Cards */}
                    {child_vitamins.length > 0 ? (
                        <div className="space-y-6">
                            {child_vitamins.map((cv, idx) => (
                                <div
                                    key={cv.id}
                                    className="vitamin-card rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-800"
                                    style={{ animationDelay: `${0.4 + idx * 0.1}s` }}
                                >
                                    <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 dark:border-gray-700 dark:from-teal-900/20 dark:to-cyan-900/20">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-800 dark:to-cyan-800">
                                                    <Pill className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">{cv.vitamin.name}</h2>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <Badge className={getProgressBadgeClass(cv.progress.status)}>{cv.progress.status}</Badge>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            ({cv.progress.completed}/{cv.progress.total} doses)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => openRecordDose(cv)}
                                                    size="sm"
                                                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm hover:from-green-600 hover:to-emerald-600"
                                                >
                                                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                                                    Record Dose
                                                </Button>
                                                <Button onClick={() => handleDeleteVitamin(cv)} size="sm" variant="destructive">
                                                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dose Table */}
                                    {cv.doses.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                            Dose #
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                            Date Given
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                            Next Due Date
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                            Status
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                            Administered By
                                                        </th>
                                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {cv.doses.map((dose, doseIdx) => (
                                                        <tr
                                                            key={dose.id}
                                                            className={`border-t transition-colors hover:bg-teal-50/50 dark:border-gray-700 dark:hover:bg-teal-900/20 ${doseIdx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-700/50'}`}
                                                        >
                                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                                                {dose.dose_number}
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-900 dark:text-gray-200">{dose.date_given ?? '-'}</td>
                                                            <td className="px-4 py-3 text-gray-900 dark:text-gray-200">
                                                                {dose.next_due_date ?? '-'}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <Badge className={getDoseBadgeClass(dose.dose_status)}>{dose.dose_status}</Badge>
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-900 dark:text-gray-200">
                                                                {dose.administered_by ?? '-'}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center justify-center">
                                                                    <button
                                                                        onClick={() => handleDeleteDose(cv, dose)}
                                                                        className="cursor-pointer rounded-md p-1.5 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No doses recorded yet.</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="fade-in-up rounded-xl bg-gray-100 p-6 text-center dark:bg-gray-800" style={{ animationDelay: '0.4s' }}>
                            <Pill className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
                            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No vitamins assigned</p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add a vitamin using the form above to get started.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Dose Modal */}
            {(recordingDoseFor || editingDose) && (
                <Dialog open={true} onOpenChange={() => closeDoseModal()}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-gray-900">
                                {editingDose ? `Edit Dose #${editingDose.dose.dose_number}` : 'Record New Dose'}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={submitDose} className="space-y-4">
                            {Object.keys(errors).length > 0 && (
                                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                    {Object.values(errors)[0]}
                                </div>
                            )}

                            {/* Dose Number - only show when creating new dose */}
                            {!editingDose && (
                                <div>
                                    <Label className="text-gray-700 dark:text-gray-300">Dose Number</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={doseForm.data.dose_number}
                                        onChange={(e) => doseForm.setData('dose_number', e.target.value)}
                                        className="bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
                                        readOnly
                                    />
                                </div>
                            )}

                            {/* Info banner when editing a pending/scheduled dose */}
                            {editingDose && !editingDose.dose.date_given && (
                                <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                    This dose was scheduled. Set the date it was given to complete it.
                                </div>
                            )}

                            {/* Yes/No radio buttons - when creating new dose OR editing pending dose */}
                            {(!editingDose || (editingDose && !editingDose.dose.date_given)) && (
                                <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                                    <Label className="font-medium text-blue-900 dark:text-blue-400">Has this dose been given?</Label>
                                    <div className="mt-3 flex gap-4">
                                        <label className="flex cursor-pointer items-center gap-2">
                                            <input
                                                type="radio"
                                                name="administered"
                                                checked={administeredChoice === 'yes'}
                                                onChange={() => handleAdministeredChange('yes')}
                                                className="h-4 w-4 cursor-pointer text-teal-600"
                                            />
                                            <span>Yes, already given</span>
                                        </label>
                                        {!editingDose && (
                                            <label className="flex cursor-pointer items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="administered"
                                                    checked={administeredChoice === 'no'}
                                                    onChange={() => handleAdministeredChange('no')}
                                                    className="h-4 w-4 cursor-pointer text-teal-600"
                                                />
                                                <span>No, scheduling for later</span>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Date Given field - shown for editing or new "yes" dose */}
                            {(editingDose || administeredChoice === 'yes') && (
                                <div>
                                    <Label className="text-gray-700 dark:text-gray-300">Date Given</Label>
                                    <Input
                                        type="date"
                                        value={doseForm.data.date_given}
                                        onChange={(e) => doseForm.setData('date_given', e.target.value)}
                                        max={getTodayDate()}
                                        className="cursor-pointer"
                                    />
                                </div>
                            )}

                            {/* Scheduled Date - when scheduling for later */}
                            {administeredChoice === 'no' && (
                                <div>
                                    <Label className="text-gray-700 dark:text-gray-300">Scheduled Date</Label>
                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">When should this dose be given?</p>
                                    <Input
                                        type="date"
                                        value={doseForm.data.next_due_date}
                                        onChange={(e) => doseForm.setData('next_due_date', e.target.value)}
                                        className="cursor-pointer"
                                    />
                                </div>
                            )}

                            {/* Remarks */}
                            <div>
                                <Label className="text-gray-700 dark:text-gray-300">Remarks (optional)</Label>
                                <textarea
                                    value={doseForm.data.remarks}
                                    onChange={(e) => doseForm.setData('remarks', e.target.value)}
                                    className="w-full rounded-md border border-gray-200 bg-gray-50 p-3 text-sm transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400"
                                    rows={2}
                                    placeholder="Any notes or observations..."
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="submit"
                                    disabled={doseForm.processing || (!editingDose && administeredChoice === null)}
                                    className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50"
                                >
                                    {doseForm.processing ? 'Saving...' : editingDose ? 'Update' : 'Record'}
                                </Button>
                                <Button type="button" variant="outline" onClick={closeDoseModal}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </AppLayout>
    );
}
