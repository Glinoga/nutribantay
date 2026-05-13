import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import smartToast from '@/utils/smartToast';
import { Head, router, useForm } from '@inertiajs/react';
import { OctagonAlert } from 'lucide-react';
import { useState } from 'react';

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
    contact_number?: string;
}

interface Props {
    child: Child;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Children Records', href: '/children' }];

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
        contact_number: child.contact_number ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (Number(data.weight) > 200) {
            smartToast.error('Weight cannot exceed 200 kg');
            return;
        }
        if (Number(data.height) > 250) {
            smartToast.error('Height cannot exceed 250 cm');
            return;
        }

        put(`/children/${child.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                smartToast.success('Child record updated successfully!');
                router.visit(`/children/${child.id}`);
            },
            onError: () => {
                smartToast.error('Failed to update record. Please try again.');
            },
        });
    };

    const handleClose = () => {
        router.visit(`/children/${child.id}`);
    };

    return (
        <AppLayout
            breadcrumbs={[
                ...breadcrumbs,
                { title: `${child.first_name} ${child.last_name}`, href: `/children/${child.id}` },
                { title: 'Edit', href: `/children/${child.id}/edit` },
            ]}
        >
            <Head title="Edit Child Record" />

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
            `}</style>

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.12),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="fade-in-up mb-6 text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-100/50 bg-white/90 px-5 py-2 shadow-lg backdrop-blur-sm">
                            <OctagonAlert className="h-5 w-5 text-teal-600" />
                            <span className="text-sm font-semibold text-teal-700">Edit Record</span>
                        </div>

                        <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
                            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                                Edit Child Record
                            </span>
                        </h1>
                        <p className="mx-auto max-w-xl text-gray-600">
                            Update information for {child.first_name} {child.last_name}
                        </p>
                    </div>

                    <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <Dialog
                            open={showModal}
                            onOpenChange={(isOpen) => {
                                if (!isOpen) handleClose();
                                setShowModal(isOpen);
                            }}
                        >
                            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-xl border-2 border-teal-100 bg-white shadow-lg">
                                <DialogHeader>
                                    <DialogTitle className="mb-6 w-full text-center text-3xl font-extrabold text-teal-600">
                                        Edit Child Record
                                    </DialogTitle>
                                </DialogHeader>

                                {Object.keys(errors).length > 0 && (
                                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                                        <div className="list-inside list-none">
                                            <OctagonAlert className="mr-2 inline-block" size={24} />
                                            {Object.entries(errors).map(([field, msg]) => (
                                                <li key={field} className="text-md inline-block">
                                                    {msg}
                                                </li>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                                        <Label className="mb-2 block text-sm font-bold text-gray-800">Name</Label>
                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                            <Input
                                                type="text"
                                                placeholder="First name"
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                                className="rounded-lg border-teal-200 bg-white text-sm font-bold text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                            />
                                            <Input
                                                type="text"
                                                placeholder="M.I. (optional)"
                                                maxLength={5}
                                                value={data.middle_initial}
                                                onChange={(e) => setData('middle_initial', e.target.value)}
                                                className="rounded-lg border-teal-200 bg-white text-sm font-bold text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                            />
                                            <Input
                                                type="text"
                                                placeholder="Last name"
                                                value={data.last_name}
                                                onChange={(e) => setData('last_name', e.target.value)}
                                                className="rounded-lg border-teal-200 bg-white text-sm font-bold text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                                            <Label className="mb-2 block text-sm font-bold text-gray-800">Sex</Label>
                                            <Select value={data.sex} onValueChange={(value) => setData('sex', value)}>
                                                <SelectTrigger className="w-full rounded-lg border-teal-200 bg-white text-sm font-bold transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none">
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

                                        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                                            <Label className="mb-2 block text-sm font-bold text-gray-800">Barangay</Label>
                                            <Input
                                                type="text"
                                                value={data.barangay}
                                                readOnly
                                                className="w-full cursor-not-allowed rounded-lg border-teal-200 bg-gray-100 text-sm font-bold text-gray-600"
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                                        <Label className="mb-2 block text-sm font-bold text-gray-800">Birthdate</Label>
                                        <Input
                                            type="date"
                                            value={data.birthdate}
                                            onChange={(e) => setData('birthdate', e.target.value)}
                                            className="rounded-lg border-teal-200 bg-white text-sm font-bold text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                                            <Label className="mb-2 block text-sm font-bold text-gray-800">Weight (kg)</Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                placeholder="Enter weight"
                                                value={data.weight}
                                                onChange={(e) => setData('weight', e.target.value)}
                                                className="rounded-lg border-teal-200 bg-white text-sm font-bold text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                            />
                                        </div>

                                        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                                            <Label className="mb-2 block text-sm font-bold text-gray-800">Height (cm)</Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                placeholder="Enter height"
                                                value={data.height}
                                                onChange={(e) => setData('height', e.target.value)}
                                                className="rounded-lg border-teal-200 bg-white text-sm font-bold text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                                        <Label className="mb-2 block text-sm font-bold text-gray-800">Contact Number</Label>
                                        <Input
                                            type="text"
                                            placeholder="e.g., 09171234567"
                                            value={data.contact_number}
                                            onChange={(e) => setData('contact_number', e.target.value)}
                                            className="rounded-lg border-teal-200 bg-white text-sm font-bold text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                            maxLength={11}
                                        />
                                    </div>

                                    <div className="mt-6 flex flex-col justify-center gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:gap-6">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-10 py-5 text-lg font-bold text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg disabled:opacity-50"
                                        >
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleClose}
                                            variant="outline"
                                            className="rounded-lg px-10 py-5 text-lg font-bold text-gray-800 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
