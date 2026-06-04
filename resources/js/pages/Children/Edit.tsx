import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import smartToast from '@/utils/smartToast';
import { Head, router, useForm } from '@inertiajs/react';
import { OctagonAlert } from 'lucide-react';
import { useState } from 'react';

interface Child {
    id: number;
    slug?: string;
    first_name: string;
    middle_initial?: string;
    last_name: string;
    sex: string;
    birthdate?: string;
    weight?: number;
    height?: number;
    contact_number?: string;
}

interface Props {
    child: Child;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Children Records', href: route('children.index') }];

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

        put(route('children.update', { child: child.slug }), {
            preserveScroll: true,
            onSuccess: () => {
                smartToast.success('Child record updated successfully!');
                router.visit(route('children.show', { child: child.slug }));
            },
            onError: () => {
                smartToast.error('Failed to update record. Please try again.');
            },
        });
    };

    const handleClose = () => {
        router.visit(route('children.show', { child: child.slug }));
    };

    return (
        <AppLayout
            breadcrumbs={[
                ...breadcrumbs,
                { title: `${child.first_name} ${child.last_name}`, href: route('children.show', { child: child.slug }) },
                { title: 'Edit', href: route('children.edit', { child: child.slug }) },
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

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.12),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.25),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.25),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="fade-in-up mb-6 text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-100/50 bg-white/90 px-5 py-2 shadow-lg backdrop-blur-sm dark:border-teal-800/50 dark:bg-gray-800/90">
                            <OctagonAlert className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                            <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">Edit Record</span>
                        </div>

                        <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl dark:text-gray-50">
                            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent dark:from-teal-300 dark:via-cyan-300 dark:to-teal-300">
                                Edit Child Record
                            </span>
                        </h1>
                        <p className="mx-auto max-w-xl text-gray-600 dark:text-gray-300">
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
                            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-xl border-2 border-teal-100 bg-white shadow-lg dark:border-teal-800 dark:bg-gray-800">
                                <DialogHeader>
                                    <DialogTitle className="mb-6 w-full text-center text-3xl font-extrabold text-teal-600 dark:text-teal-400">
                                        Edit Child Record
                                    </DialogTitle>
                                </DialogHeader>

                                {Object.keys(errors).length > 0 && (
                                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
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
                                    <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                                        <Label className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-100">Name</Label>
                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                            <Input
                                                type="text"
                                                placeholder="First name"
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value.replace(/[^a-zA-ZñÑ\s'-.]/g, ''))}
                                                className="rounded-md border-teal-200 bg-white text-sm font-bold text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-teal-700 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                            <Input
                                                type="text"
                                                placeholder="M.I. (optional)"
                                                maxLength={5}
                                                value={data.middle_initial}
                                                onChange={(e) => setData('middle_initial', e.target.value.replace(/[^a-zA-ZñÑ.]/g, ''))}
                                                className="rounded-md border-teal-200 bg-white text-sm font-bold text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-teal-700 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                            <Input
                                                type="text"
                                                placeholder="Last name"
                                                value={data.last_name}
                                                onChange={(e) => setData('last_name', e.target.value.replace(/[^a-zA-ZñÑ\s'-.]/g, ''))}
                                                className="rounded-md border-teal-200 bg-white text-sm font-bold text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-teal-700 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                                            <Label className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-100">Sex</Label>
                                            <Select value={data.sex} onValueChange={(value) => setData('sex', value)}>
                                                <SelectTrigger className="w-full rounded-md border-teal-200 bg-white text-sm font-bold transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-teal-700 dark:bg-gray-700 dark:text-gray-100">
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
                                    </div>

                                    <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                                        <Label className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-100">Birthdate *</Label>
                                        <Input
                                            type="date"
                                            value={data.birthdate}
                                            onChange={(e) => setData('birthdate', e.target.value)}
                                            className="rounded-md border-teal-200 bg-white text-sm font-bold text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-teal-700 dark:bg-gray-700 dark:text-gray-100"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                                            <Label className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-100">Weight (kg)</Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                placeholder="Enter weight"
                                                value={data.weight}
                                                onChange={(e) => setData('weight', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
                                                className="rounded-md border-teal-200 bg-white text-sm font-bold text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-teal-700 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                        </div>

                                        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                                            <Label className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-100">Height (cm)</Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                placeholder="Enter height"
                                                value={data.height}
                                                onChange={(e) => setData('height', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
                                                className="rounded-md border-teal-200 bg-white text-sm font-bold text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-teal-700 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                                        <Label className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-100">Contact Number</Label>
                                        <Input
                                            type="text"
                                            placeholder="e.g., 09171234567"
                                            value={data.contact_number}
                                            onChange={(e) => setData('contact_number', e.target.value.replace(/\D/g, ''))}
                                            className="rounded-md border-teal-200 bg-white text-sm font-bold text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-teal-700 dark:bg-gray-700 dark:text-gray-100"
                                            maxLength={11}
                                        />
                                    </div>

                                    <div className="mt-6 flex flex-col justify-center gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:gap-6 dark:border-gray-700">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="rounded-md bg-gradient-to-r from-teal-500 to-cyan-500 px-10 py-5 text-lg font-bold text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg disabled:opacity-50"
                                        >
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleClose}
                                            variant="outline"
                                            className="rounded-md px-10 py-5 text-lg font-bold text-gray-800 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg dark:text-gray-200 dark:hover:bg-gray-700"
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
