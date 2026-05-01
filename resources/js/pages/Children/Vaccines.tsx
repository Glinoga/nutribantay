import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

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

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Children', href: '/children' },
        { title: child.fullname, href: `/children/${child.id}` },
        { title: 'Vaccines', href: `/children/${child.id}/vaccines` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Vaccines - ${child.fullname}`} />

            <div className="mx-auto max-w-5xl py-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Vaccine Tracker — {child.fullname}</h1>
                        <p className="text-gray-600">Barangay: {child.barangay}</p>
                    </div>
                    <Link href={`/children/${child.id}`} className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">
                        Back to Child
                    </Link>
                </div>

                {/* Add Vaccine to Child */}
                {available_vaccines.length > 0 && (
                    <div className="mb-6 rounded-lg bg-blue-50 p-4 shadow">
                        <h2 className="mb-2 font-semibold">Add Vaccine to Child</h2>
                        <form onSubmit={handleAddVaccine} className="flex gap-2">
                            <select
                                value={selectedVaccineId ?? ''}
                                onChange={(e) => setSelectedVaccineId(e.target.value ? Number(e.target.value) : null)}
                                className="flex-1 rounded border px-3 py-2"
                            >
                                <option value="">Select a vaccine...</option>
                                {available_vaccines.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                disabled={!selectedVaccineId}
                                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                Add
                            </button>
                        </form>
                    </div>
                )}

                {/* Vaccine Cards */}
                {child_vaccines.length > 0 ? (
                    <div className="space-y-6">
                        {child_vaccines.map((cv) => (
                            <div key={cv.id} className="rounded-lg bg-white p-6 shadow">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-lg font-bold">{cv.vaccine.name}</h2>
                                        <span className={`rounded px-2 py-0.5 text-xs font-medium ${getProgressBadgeClass(cv.progress.status)}`}>
                                            {cv.progress.status}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            ({cv.progress.completed}/{cv.progress.total} doses)
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openRecordDose(cv)}
                                            className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                                        >
                                            Record Dose
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Remove ${cv.vaccine.name} from this child? All dose records will be deleted.`)) {
                                                    router.delete(`/children/${child.id}/vaccines/${cv.id}`);
                                                }
                                            }}
                                            className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                {/* Dose Table */}
                                {cv.doses.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-3 py-2 text-left">Dose #</th>
                                                    <th className="px-3 py-2 text-left">Date Given</th>
                                                    <th className="px-3 py-2 text-left">Next Due Date</th>
                                                    <th className="px-3 py-2 text-left">Status</th>
                                                    <th className="px-3 py-2 text-left">Administered By</th>
                                                    <th className="px-3 py-2 text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cv.doses.map((dose) => (
                                                    <tr key={dose.id} className="border-t hover:bg-gray-50">
                                                        <td className="px-3 py-2 font-medium">{dose.dose_number}</td>
                                                        <td className="px-3 py-2">{dose.date_given ?? '-'}</td>
                                                        <td className="px-3 py-2">{dose.next_due_date ?? '-'}</td>
                                                        <td className="px-3 py-2">
                                                            <span className={`rounded px-2 py-0.5 text-xs ${getDoseBadgeClass(dose.dose_status)}`}>
                                                                {dose.dose_status}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2">{dose.administered_by ?? '-'}</td>
                                                        <td className="px-3 py-2 text-center">
                                                            <div className="flex justify-center gap-2">
                                                                <button
                                                                    onClick={() => openEditDose(cv, dose)}
                                                                    className="text-sm text-blue-600 hover:underline"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm('Delete this dose record?')) {
                                                                            router.delete(`/children/${child.id}/vaccines/${cv.id}/doses/${dose.id}`);
                                                                        }
                                                                    }}
                                                                    className="text-sm text-red-600 hover:underline"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No doses recorded yet.</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg bg-gray-100 p-6 text-center">
                        <p className="text-gray-500">No vaccines assigned to this child yet.</p>
                    </div>
                )}
            </div>

            {/* Dose Modal */}
            {(recordingDoseFor || editingDose) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeDoseModal}>
                    <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold">{editingDose ? `Record Dose #${editingDose.dose.dose_number}` : 'Record Dose'}</h2>
                            <button type="button" onClick={closeDoseModal} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={submitDose} className="space-y-4">
                            {Object.keys(errors).length > 0 && (
                                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{Object.values(errors)[0]}</div>
                            )}

                            {/* Dose Number - only show when creating new dose */}
                            {!editingDose && (
                                <div>
                                    <label className="block font-medium">Dose Number</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={doseForm.data.dose_number}
                                        onChange={(e) => doseForm.setData('dose_number', e.target.value)}
                                        className="w-full rounded border bg-gray-50 px-3 py-2"
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
                                <div className="rounded-lg bg-blue-50 p-3">
                                    <label className="block font-medium text-blue-900">Has this dose been given?</label>
                                    <div className="mt-2 flex gap-4">
                                        <label className="flex cursor-pointer items-center gap-2">
                                            <input
                                                type="radio"
                                                name="administered"
                                                checked={administeredChoice === 'yes'}
                                                onChange={() => handleAdministeredChange('yes')}
                                                className="h-4 w-4"
                                            />
                                            <span>Yes, already given</span>
                                        </label>
                                        <label className="flex cursor-pointer items-center gap-2">
                                            <input
                                                type="radio"
                                                name="administered"
                                                checked={administeredChoice === 'no'}
                                                onChange={() => handleAdministeredChange('no')}
                                                className="h-4 w-4"
                                            />
                                            <span>No, scheduling for later</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Date Given field - shown for editing or new "yes" dose */}
                            {(editingDose || administeredChoice === 'yes') && (
                                <div>
                                    <label className="block font-medium">Date Given</label>
                                    <input
                                        type="date"
                                        value={doseForm.data.date_given}
                                        onChange={(e) => doseForm.setData('date_given', e.target.value)}
                                        className="w-full rounded border px-3 py-2"
                                    />
                                </div>
                            )}

                            {/* Next Due Date / Scheduled Date - single unified field */}
                            {(editingDose || administeredChoice === 'yes' || administeredChoice === 'no') && (
                                <div>
                                    <label className="block font-medium">
                                        {editingDose
                                            ? editingDose.dose.date_given
                                                ? 'Next Due Date (optional)'
                                                : 'Scheduled Date (optional)'
                                            : administeredChoice === 'yes'
                                              ? 'Next Due Date (optional)'
                                              : 'Scheduled Date'}
                                    </label>
                                    <p className="mb-1 text-sm text-gray-500">
                                        {editingDose
                                            ? editingDose.dose.date_given
                                                ? 'When should the next dose be scheduled?'
                                                : 'When should this dose be given?'
                                            : administeredChoice === 'yes'
                                              ? 'When should the next dose be scheduled?'
                                              : 'When should this dose be given?'}
                                    </p>
                                    <input
                                        type="date"
                                        value={doseForm.data.next_due_date}
                                        onChange={(e) => doseForm.setData('next_due_date', e.target.value)}
                                        className="w-full rounded border px-3 py-2"
                                    />
                                </div>
                            )}

                            {/* Remarks */}
                            <div>
                                <label className="block font-medium">Remarks (optional)</label>
                                <textarea
                                    value={doseForm.data.remarks}
                                    onChange={(e) => doseForm.setData('remarks', e.target.value)}
                                    className="w-full rounded border px-3 py-2"
                                    rows={2}
                                    placeholder="Any notes or observations..."
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={doseForm.processing || (!editingDose && administeredChoice === null)}
                                    className="flex-1 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    {doseForm.processing ? 'Saving...' : editingDose ? 'Update' : 'Record'}
                                </button>
                                <button type="button" onClick={closeDoseModal} className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
