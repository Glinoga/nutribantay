import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { OctagonAlert } from 'lucide-react';
import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';

interface Child {
    id: number;
    first_name: string;
    middle_initial?: string;
    last_name: string;
    sex: string;
    birthdate?: string;
    weight?: number;
    height?: number;
    barangay?: string;
}

interface Props {
    child: Child;
}

export default function Edit({ child }: Props) {
    const [showModal, setShowModal] = useState(true);

    const { data, setData, put, processing, errors } = useForm({
        first_name: child.first_name || '',
        middle_initial: child.middle_initial || '',
        last_name: child.last_name || '',
        sex: child.sex || 'Male',
        birthdate: child.birthdate || '',
        weight: String(child.weight ?? ''),
        height: String(child.height ?? ''),
        barangay: child.barangay ?? '',
    });

    const greenPalette = '#355e3b';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (Number(data.weight) > 200) {
            toast.error('Weight cannot exceed 200 kg');
            return;
        }
        if (Number(data.height) > 250) {
            toast.error('Height cannot exceed 250 cm');
            return;
        }

        put(`/children/${child.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Child record updated successfully!');
                router.visit('/children');
            },
            onError: () => {
                toast.error('Failed to update record. Please try again.');
            },
        });
    };

    const handleClose = () => {
        router.visit('/children');
    };

    return (
        <AppLayout>
            <Head title="Edit Child Record" />
            <Toaster position="top-right" reverseOrder={false} />

            <Dialog
                open={showModal}
                onOpenChange={(isOpen) => {
                    if (!isOpen) handleClose();
                    setShowModal(isOpen);
                }}
            >
                <DialogContent
                    className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-xl border-2 bg-green-50 shadow-lg"
                    style={{
                        borderColor: greenPalette,
                        boxShadow: `0 0 25px ${greenPalette}55`,
                    }}
                >
                    <DialogHeader>
                        <DialogTitle className="mb-6 w-full text-center text-3xl font-extrabold" style={{ color: greenPalette }}>
                            Edit Child Record
                        </DialogTitle>
                    </DialogHeader>

                    {Object.keys(errors).length > 0 && (
                        <div className="mb-4 rounded border border-red-600 bg-red-100 p-4 text-red-700">
                            <div className="list-inside list-none">
                                <OctagonAlert className="mr-2 inline-block" size={24} />
                                {Object.entries(errors).map(([field, message]) => (
                                    <li className="text-md inline-block" key={field}>
                                        {message}
                                    </li>
                                ))}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="rounded-lg border bg-green-50 p-4" style={{ borderColor: greenPalette }}>
                            <Label className="mb-2 block text-sm font-bold text-gray-800">Name</Label>
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                <Input
                                    type="text"
                                    placeholder="First name"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    className="rounded-lg border bg-green-50 text-sm font-bold text-gray-800"
                                    style={{ borderColor: greenPalette }}
                                />
                                <Input
                                    type="text"
                                    placeholder="M.I. (optional)"
                                    maxLength={5}
                                    value={data.middle_initial}
                                    onChange={(e) => setData('middle_initial', e.target.value)}
                                    className="rounded-lg border bg-green-50 text-sm font-bold text-gray-800"
                                    style={{ borderColor: greenPalette }}
                                />
                                <Input
                                    type="text"
                                    placeholder="Last name"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    className="rounded-lg border bg-green-50 text-sm font-bold text-gray-800"
                                    style={{ borderColor: greenPalette }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded-lg border bg-green-50 p-4" style={{ borderColor: greenPalette }}>
                                <Label className="mb-2 block text-sm font-bold text-gray-800">Sex</Label>
                                <Select value={data.sex} onValueChange={(value) => setData('sex', value)}>
                                    <SelectTrigger className="w-full rounded-lg bg-green-50 text-sm font-bold" style={{ borderColor: greenPalette }}>
                                        <SelectValue placeholder="Select sex" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male" className="font-bold">
                                            Male
                                        </SelectItem>
                                        <SelectItem value="Female" className="font-bold">
                                            Female
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="rounded-lg border bg-green-50 p-4" style={{ borderColor: greenPalette }}>
                                <Label className="mb-2 block text-sm font-bold text-gray-800">Barangay</Label>
                                <Input
                                    type="text"
                                    value={data.barangay}
                                    readOnly
                                    className="w-full cursor-not-allowed rounded-lg bg-gray-100 text-sm font-bold text-gray-600"
                                    style={{ borderColor: greenPalette }}
                                />
                            </div>
                        </div>

                        <div className="rounded-lg border bg-green-50 p-4" style={{ borderColor: greenPalette }}>
                            <Label className="mb-2 block text-sm font-bold text-gray-800">Birthdate</Label>
                            <Input
                                type="date"
                                value={data.birthdate}
                                onChange={(e) => setData('birthdate', e.target.value)}
                                className="rounded-lg border bg-green-50 text-sm font-bold text-gray-800"
                                style={{ borderColor: greenPalette }}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded-lg border bg-green-50 p-4" style={{ borderColor: greenPalette }}>
                                <Label className="mb-2 block text-sm font-bold text-gray-800">Weight (kg)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="Enter weight"
                                    value={data.weight}
                                    onChange={(e) => setData('weight', e.target.value)}
                                    className="rounded-lg border bg-green-50 text-sm font-bold text-gray-800"
                                    style={{ borderColor: greenPalette }}
                                />
                            </div>

                            <div className="rounded-lg border bg-green-50 p-4" style={{ borderColor: greenPalette }}>
                                <Label className="mb-2 block text-sm font-bold text-gray-800">Height (cm)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="Enter height"
                                    value={data.height}
                                    onChange={(e) => setData('height', e.target.value)}
                                    className="rounded-lg border bg-green-50 text-sm font-bold text-gray-800"
                                    style={{ borderColor: greenPalette }}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center gap-6 border-t pt-6">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg px-10 py-5 text-lg font-bold text-white shadow-md transition-all hover:shadow-lg"
                                style={{
                                    backgroundColor: greenPalette,
                                    boxShadow: `0 4px 10px ${greenPalette}80`,
                                }}
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleClose}
                                className="rounded-lg bg-gray-200 px-10 py-5 text-lg font-bold text-gray-800 shadow-md transition-all hover:bg-gray-300 hover:shadow-lg"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
