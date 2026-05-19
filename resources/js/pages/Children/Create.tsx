import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { displayPhoneNumber, formatPhoneNumber } from '@/lib/phoneUtils';
import { route } from '@/lib/routes';
import { smartToast } from '@/utils/smartToast';
import { Head, router, useForm } from '@inertiajs/react';
import { Baby, Calendar, CheckCircle2, OctagonAlert, Phone, Ruler, Sparkles, User, Weight } from 'lucide-react';
import React, { useState } from 'react';

export default function ChildrenCreate() {
    const [showModal, setShowModal] = useState(true);

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        middle_initial: '',
        last_name: '',
        sex: 'Male',
        birthdate: '',
        weight: '',
        height: '',
        contact_number: '',
    });

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setData('contact_number', formatted);
    };

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

        post(route('children.store'), {
            onSuccess: () => {
                smartToast.success('Child successfully registered! 🎉');
                reset();
                router.visit(route('children.index'));
            },
            onError: () => {
                smartToast.error('Failed to register child. Please check your inputs.');
            },
        });
    };

    const handleClose = () => {
        router.visit(route('children.index'));
    };

    const bmi = data.weight && data.height ? (Number(data.weight) / Math.pow(Number(data.height) / 100, 2)).toFixed(1) : null;

    const getBMIStatus = (bmi: number) => {
        if (bmi < 18.5) return { text: 'Underweight', color: 'text-orange-600 dark:text-orange-400' };
        if (bmi < 25) return { text: 'Normal', color: 'text-green-600 dark:text-green-400' };
        if (bmi < 30) return { text: 'Overweight', color: 'text-yellow-600 dark:text-yellow-400' };
        return { text: 'Obese', color: 'text-red-600 dark:text-red-400' };
    };

    return (
        <AppLayout>
            <Head title="Add Child" />

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
                <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.12),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.25),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.25),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="fade-in-up mb-6 text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-100/50 bg-white/90 px-5 py-2 shadow-lg backdrop-blur-sm dark:border-teal-800/50 dark:bg-gray-800/90">
                            <Baby className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                            <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">Child Registration</span>
                        </div>

                        <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl dark:text-gray-50">
                            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent dark:from-teal-300 dark:via-cyan-300 dark:to-teal-300">
                                Register New Child
                            </span>
                        </h1>
                        <p className="mx-auto max-w-xl text-gray-600 dark:text-gray-300">Add a new child to the nutrition tracking system</p>
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
                                        Register New Child
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
                                        <Label className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
                                            <User className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                            Child's Name
                                            <span className="text-red-500">*</span>
                                        </Label>
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
                                            <Label className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
                                                <User className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                                Sex
                                                <span className="text-red-500">*</span>
                                            </Label>
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

                                        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                                            <Label className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
                                                <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                                Birthdate
                                            </Label>
                                            <Input
                                                type="date"
                                                value={data.birthdate}
                                                onChange={(e) => setData('birthdate', e.target.value)}
                                                className="rounded-md border-teal-200 bg-white text-sm font-bold text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-teal-700 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                                            <Label className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
                                                <Weight className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                                Weight (kg)
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                placeholder="Enter weight"
                                                value={data.weight}
                                                onChange={(e) => setData('weight', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
                                                min="0"
                                                max="200"
                                                className="rounded-md border-teal-200 bg-white text-sm font-bold text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-teal-700 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Maximum: 200 kg</p>
                                        </div>

                                        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                                            <Label className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
                                                <Ruler className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                                Height (cm)
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                placeholder="Enter height"
                                                value={data.height}
                                                onChange={(e) => setData('height', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
                                                min="0"
                                                max="250"
                                                className="rounded-md border-teal-200 bg-white text-sm font-bold text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-teal-700 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Maximum: 250 cm</p>
                                        </div>
                                    </div>

                                    {bmi && (
                                        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Body Mass Index (BMI)</p>
                                                    <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{bmi}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Status</p>
                                                    <p className={`text-xl font-bold ${getBMIStatus(Number(bmi)).color}`}>
                                                        {getBMIStatus(Number(bmi)).text}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                                        <Label className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
                                            <Phone className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                            Guardian Contact Number
                                        </Label>
                                        <Input
                                            type="tel"
                                            placeholder="+63 XXX XXX XXXX"
                                            value={displayPhoneNumber(data.contact_number)}
                                            onChange={handlePhoneNumberChange}
                                            className="rounded-md border-teal-200 bg-white text-sm font-bold text-gray-800 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-teal-700 dark:bg-gray-700 dark:text-gray-100"
                                        />
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Format: +63 XXX XXX XXXX</p>
                                    </div>

                                    <div className="mt-6 flex flex-col justify-center gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:gap-6 dark:border-gray-700">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="rounded-md bg-gradient-to-r from-teal-500 to-cyan-500 px-10 py-5 text-lg font-bold text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg disabled:opacity-50"
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="mr-2 h-5 w-5" />
                                                    Register Child
                                                </>
                                            )}
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

                                    <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                                        <div className="flex items-start gap-3">
                                            <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600 dark:text-teal-400" />
                                            <div>
                                                <p className="font-semibold text-teal-800 dark:text-teal-400">Quick Tips:</p>
                                                <ul className="mt-1 space-y-1 text-sm text-teal-700 dark:text-teal-300">
                                                    <li>
                                                        • All fields marked with <span className="text-red-500">*</span> are required
                                                    </li>
                                                    <li>• Contact number helps us reach guardians for important updates</li>
                                                    <li>• Weight and height are used to calculate BMI automatically</li>
                                                </ul>
                                            </div>
                                        </div>
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
