import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Edit2, Plus, Syringe, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

type Vaccine = {
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

type ChildVaccine = {
    id: number;
    vaccine: Vaccine;
    progress: {
        completed: number;
        total: number;
        status: string;
    };
    doses: Dose[];
};

type ChildVaccinesProps = {
    child: {
        id: number;
        fullname: string;
        barangay: string;
    };
    child_vaccines: ChildVaccine[];
    available_vaccines: Vaccine[];
};

const getDoseBadgeClass = (status: string) => {
    switch (status) {
        case 'Completed':
            return 'bg-green-100 text-green-800';
        case 'Overdue':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-yellow-100 text-yellow-800';
    }
};

const getProgressBadgeClass = (status: string) => {
    switch (status) {
        case 'Completed':
            return 'bg-green-100 text-green-800';
        case 'In Progress':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Children Records', href: '/children' }];

export default function Vaccines({ child, child_vaccines, available_vaccines }: ChildVaccinesProps) {
    const [selectedVaccineId, setSelectedVaccineId] = useState<number | null>(null);
    const [recordingDoseFor, setRecordingDoseFor] = useState<ChildVaccine | null>(null);
    const [editingDose, setEditingDose] = useState<{ cv: ChildVaccine; dose: Dose } | null>(null);
    const [administeredChoice, setAdministeredChoice] = useState<'yes' | 'no' | null>(null);
    const errors = usePage<{ errors: Record<string, string> }>().props.errors;

    const doseForm = useForm({
        dose_number: '',
        date_given: '',
        next_due_date: '',
        remarks: '',
    });

    const handleAddVaccine = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVaccineId) return;

        router.post(`/children/${child.id}/vaccines`, {
            vaccine_id: selectedVaccineId,
        });
    };

    const openRecordDose = (cv: ChildVaccine) => {
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

    const openEditDose = (cv: ChildVaccine, dose: Dose) => {
        setEditingDose({ cv, dose });
        setRecordingDoseFor(null);
        setAdministeredChoice(dose.date_given ? 'yes' : 'no');
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
            router.patch(`/children/${child.id}/vaccines/${editingDose.cv.id}/doses/${editingDose.dose.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => closeDoseModal(),
            });
        } else if (recordingDoseFor) {
            router.post(
                `/children/${child.id}/vaccines/${recordingDoseFor.id}/doses`,
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

    const handleDeleteVaccine = (cv: ChildVaccine) => {
        MySwal.fire({
            title: `Remove ${cv.vaccine.name}?`,
            text: 'All dose records will be deleted. This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0891B2',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove it!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/children/${child.id}/vaccines/${cv.id}`);
            }
        });
    };

    const handleDeleteDose = (cv: ChildVaccine, dose: Dose) => {
        MySwal.fire({
            title: 'Delete Dose Record?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0891B2',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/children/${child.id}/vaccines/${cv.id}/doses/${dose.id}`);
            }
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                ...breadcrumbs,
                { title: child.fullname, href: `/children/${child.id}` },
                { title: 'Vaccines', href: `/children/${child.id}/vaccines` },
            ]}
        >
            <Head title={`Vaccines - ${child.fullname}`} />

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

                .vaccine-card {
                    animation: fadeInUp 0.5s ease-out forwards;
                    opacity: 0;
                }

                .vaccine-card:nth-child(1) { animation-delay: 0.1s; }
                .vaccine-card:nth-child(2) { animation-delay: 0.2s; }
                .vaccine-card:nth-child(3) { animation-delay: 0.3s; }
                .vaccine-card:nth-child(4) { animation-delay: 0.4s; }
                .vaccine-card:nth-child(5) { animation-delay: 0.5s; }

                .action-btn {
                    transition: all 0.2s ease;
                }

                .action-btn:hover {
                    transform: scale(1.05);
                }
            `}</style>

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.12),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="fade-in-up mb-6 text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-100/50 bg-white/90 px-5 py-2 shadow-lg backdrop-blur-sm">
                            <Syringe className="h-5 w-5 text-teal-600" />
                            <span className="text-sm font-semibold text-teal-700">Vaccine Tracker</span>
                        </div>

                        <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
                            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                                {child.fullname}
                            </span>
                        </h1>
                        <p className="mx-auto max-w-xl text-gray-600">Track and manage vaccination records for {child.fullname}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="fade-in-up mb-6 flex flex-wrap gap-3" style={{ animationDelay: '0.2s' }}>
                        <Link href={`/children/${child.id}`}>
                            <button className="action-btn inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg">
                                <X className="h-4 w-4" />
                                Back to Child
                            </button>
                        </Link>

                        <Link href="/children">
                            <button className="action-btn inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50">
                                <X className="h-4 w-4" />
                                Back to List
                            </button>
                        </Link>
                    </div>

                    {/* Add Vaccine Section */}
                    {available_vaccines.length > 0 && (
                        <div
                            className="fade-in-up mb-6 rounded-xl border-0 bg-white p-6 shadow-md transition-all hover:shadow-lg"
                            style={{ animationDelay: '0.3s' }}
                        >
                            <div className="mb-4 flex items-center gap-2">
                                <Plus className="h-5 w-5 text-teal-600" />
                                <h2 className="text-xl font-bold text-gray-900">Add Vaccine to Child</h2>
                            </div>
                            <form onSubmit={handleAddVaccine} className="flex gap-3">
                                <Select
                                    value={selectedVaccineId ? String(selectedVaccineId) : ''}
                                    onValueChange={(val) => setSelectedVaccineId(Number(val))}
                                >
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Select a vaccine..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {available_vaccines.map((v) => (
                                            <SelectItem key={v.id} value={String(v.id)}>
                                                {v.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    type="submit"
                                    disabled={!selectedVaccineId}
                                    className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Vaccine
                                </Button>
                            </form>
                        </div>
                    )}

                    {/* Vaccine Cards */}
                    {child_vaccines.length > 0 ? (
                        <div className="space-y-6">
                            {child_vaccines.map((cv, idx) => (
                                <div
                                    key={cv.id}
                                    className="vaccine-card rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-lg"
                                    style={{ animationDelay: `${0.4 + idx * 0.1}s` }}
                                >
                                    <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-cyan-100">
                                                    <Syringe className="h-5 w-5 text-teal-600" />
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-bold text-gray-900">{cv.vaccine.name}</h2>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <Badge className={getProgressBadgeClass(cv.progress.status)}>{cv.progress.status}</Badge>
                                                        <span className="text-sm text-gray-500">
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
                                                <Button onClick={() => handleDeleteVaccine(cv)} size="sm" variant="destructive">
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
                                                <thead className="bg-gradient-to-r from-teal-50 to-cyan-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Dose #</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date Given</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Next Due Date</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Administered By</th>
                                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {cv.doses.map((dose, doseIdx) => (
                                                        <tr
                                                            key={dose.id}
                                                            className={`border-t transition-colors hover:bg-teal-50/50 ${doseIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                                                        >
                                                            <td className="px-4 py-3 font-medium text-gray-900">{dose.dose_number}</td>
                                                            <td className="px-4 py-3 text-gray-900">{dose.date_given ?? '-'}</td>
                                                            <td className="px-4 py-3 text-gray-900">{dose.next_due_date ?? '-'}</td>
                                                            <td className="px-4 py-3">
                                                                <Badge className={getDoseBadgeClass(dose.dose_status)}>{dose.dose_status}</Badge>
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-900">{dose.administered_by ?? '-'}</td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <button
                                                                        onClick={() => openEditDose(cv, dose)}
                                                                        className="cursor-pointer rounded-lg p-1.5 text-teal-600 transition-colors hover:bg-teal-50"
                                                                    >
                                                                        <Edit2 className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteDose(cv, dose)}
                                                                        className="cursor-pointer rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50"
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
                                        <div className="px-6 py-4 text-center text-gray-500">No doses recorded yet.</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="fade-in-up rounded-xl bg-gray-100 p-6 text-center" style={{ animationDelay: '0.4s' }}>
                            <Syringe className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <p className="text-lg font-medium text-gray-900">No vaccines assigned</p>
                            <p className="mt-1 text-sm text-gray-500">Add a vaccine using the form above to get started.</p>
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
                                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{Object.values(errors)[0]}</div>
                            )}

                            {/* Dose Number - only show when creating new dose */}
                            {!editingDose && (
                                <div>
                                    <Label className="text-gray-700">Dose Number</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={doseForm.data.dose_number}
                                        onChange={(e) => doseForm.setData('dose_number', e.target.value)}
                                        className="bg-gray-50"
                                        readOnly
                                    />
                                </div>
                            )}

                            {/* Info banner when editing a pending/scheduled dose */}
                            {editingDose && !editingDose.dose.date_given && (
                                <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
                                    This dose was scheduled. Set the date it was given to complete it.
                                </div>
                            )}

                            {/* Yes/No radio buttons - only when creating new dose */}
                            {!editingDose && (
                                <div className="rounded-lg bg-blue-50 p-4">
                                    <Label className="font-medium text-blue-900">Has this dose been given?</Label>
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
                                    </div>
                                </div>
                            )}

                            {/* Date Given field - shown for editing or new "yes" dose */}
                            {(editingDose || administeredChoice === 'yes') && (
                                <div>
                                    <Label className="text-gray-700">Date Given</Label>
                                    <Input
                                        type="date"
                                        value={doseForm.data.date_given}
                                        onChange={(e) => doseForm.setData('date_given', e.target.value)}
                                        className="cursor-pointer"
                                    />
                                </div>
                            )}

                            {/* Next Due Date / Scheduled Date */}
                            {(editingDose || administeredChoice === 'yes' || administeredChoice === 'no') && (
                                <div>
                                    <Label className="text-gray-700">
                                        {editingDose
                                            ? editingDose.dose.date_given
                                                ? 'Next Due Date (optional)'
                                                : 'Scheduled Date (optional)'
                                            : administeredChoice === 'yes'
                                              ? 'Next Due Date (optional)'
                                              : 'Scheduled Date'}
                                    </Label>
                                    <p className="mb-2 text-sm text-gray-500">
                                        {editingDose
                                            ? editingDose.dose.date_given
                                                ? 'When should the next dose be scheduled?'
                                                : 'When should this dose be given?'
                                            : administeredChoice === 'yes'
                                              ? 'When should the next dose be scheduled?'
                                              : 'When should this dose be given?'}
                                    </p>
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
                                <Label className="text-gray-700">Remarks (optional)</Label>
                                <textarea
                                    value={doseForm.data.remarks}
                                    onChange={(e) => doseForm.setData('remarks', e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
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
