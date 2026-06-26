import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import smartToast from '@/utils/smartToast';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Calculator, Check, Heart, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

type CatalogItem = {
    id: number;
    name: string;
};

type HealthLogForm = {
    weight: string | number;
    height: string | number;
    bmi: string | number;
    nutrition_status: string;
    micronutrient_powder: string;
    ruf: string;
    rusf: string;
    complementary_food: string;
    deworming: boolean;
    vaccine_ids: number[];
    vitamin_ids: number[];
};

type HealthLog = {
    id: number;
    weight?: number | null;
    height?: number | null;
    bmi?: number | null;
    nutrition_status?: string | null;
    micronutrient_powder?: string | null;
    ruf?: string | null;
    rusf?: string | null;
    complementary_food?: string | null;
    vitamin_a?: boolean;
    deworming?: boolean;
    child_id?: number;
    child?: { fullname: string; id: number; slug?: string };
};

type EditProps = {
    healthlog: HealthLog;
    child_id?: number;
    vaccines: CatalogItem[];
    vitamins: CatalogItem[];
    existingVaccineIds: number[];
    existingVitaminIds: number[];
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Children Records', href: route('children.index') }];

export default function Edit({ healthlog, child_id: propChildId, vaccines, vitamins, existingVaccineIds, existingVitaminIds }: EditProps) {
    const [showSuccess, setShowSuccess] = useState(false);

    const { data, setData, put, processing, errors } = useForm<HealthLogForm>({
        // child_id is intentionally excluded — child-centric design, not editable
        weight: healthlog.weight ?? '',
        height: healthlog.height ?? '',
        bmi: healthlog.bmi ?? '',
        nutrition_status: healthlog.nutrition_status ?? '',

        micronutrient_powder: healthlog.micronutrient_powder ?? '',
        ruf: healthlog.ruf ?? '',
        rusf: healthlog.rusf ?? '',
        complementary_food: healthlog.complementary_food ?? '',
        deworming: !!healthlog.deworming,
        vaccine_ids: existingVaccineIds,
        vitamin_ids: existingVitaminIds,
    });

    // Auto-calc BMI
    useEffect(() => {
        const w = parseFloat(String(data.weight ?? ''));
        const h = parseFloat(String(data.height ?? ''));

        if (w > 0 && h > 0) {
            const bmiValue = w / Math.pow(h / 100, 2); // cm → meters
            setData('bmi', bmiValue.toFixed(2));
        } else {
            setData('bmi', '');
        }
    }, [data.weight, data.height, setData]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('healthlogs.update', { healthlog: healthlog.id }), {
            onSuccess: () => {
                setShowSuccess(true);
                smartToast.success('Health log updated successfully!');
            },
            onError: () => {
                smartToast.error('Failed to update health log. Please check the form.');
            },
        });
    };

    // Use child_id from controller prop first, then fall back to healthlog data
    const childId = propChildId ?? healthlog.child_id ?? healthlog.child?.id;
    const childSlug = healthlog.child?.slug ?? childId;
    const childName = healthlog.child?.fullname || 'Child';

    return (
        <AppLayout
            breadcrumbs={[
                ...breadcrumbs,
                { title: childName, href: route('children.show', { child: childSlug }) },
                { title: 'Edit Health Log', href: route('healthlogs.edit', { healthlog: healthlog.id }) },
            ]}
        >
            <Head title={`Edit Health Log - ${childName}`} />

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

                .form-section {
                    transition: all 0.2s ease;
                }

                .form-section:hover {
                    box-shadow: 0 4px 12px rgba(8, 145, 178, 0.1);
                }
            `}</style>

            <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.12),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.25),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.25),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="fade-in-up mb-6 text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-100/50 bg-white/90 px-5 py-2 shadow-lg backdrop-blur-sm dark:border-teal-800/50 dark:bg-gray-800/90">
                            <Heart className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                            <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">Edit Health Log</span>
                        </div>

                        <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl dark:text-gray-50">
                            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent dark:from-teal-300 dark:via-cyan-300 dark:to-teal-300">
                                Edit Health Log
                            </span>
                        </h1>
                        <p className="mx-auto max-w-xl text-gray-600 dark:text-gray-300">Update health record for {childName}</p>
                    </div>

                    {/* Data Correction Message */}
                    <div
                        className="fade-in-up mb-6 rounded-xl border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20"
                        style={{ animationDelay: '0.1s' }}
                    >
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400" />
                            <div className="flex-1">
                                <h3 className="font-bold text-amber-900 dark:text-amber-100">For Data Correction Only</h3>
                                <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                                    This page is only for correcting incorrect data that was previously entered. If you want to add a new health log
                                    record for this child, please use the button below instead.
                                </p>
                                {childId && (
                                    <Link href={route('children.healthlogs.create', { child: childSlug })}>
                                        <Button className="mt-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md hover:from-teal-600 hover:to-cyan-600">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add New Health Log
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Success Message */}
                    {showSuccess && (
                        <div className="fade-in-up mb-6 rounded-xl border-2 border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                            <div className="flex items-center gap-2">
                                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <span className="font-medium">Health log updated successfully!</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={submit} className="fade-in-up space-y-6" style={{ animationDelay: '0.2s' }}>
                        {/* Measurements Section */}
                        <div className="form-section rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 dark:border-gray-700 dark:from-teal-900/20 dark:to-cyan-900/20">
                                <div className="flex items-center gap-2">
                                    <Calculator className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Measurements</h2>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
                                <div>
                                    <Label htmlFor="weight" className="text-gray-700 dark:text-gray-200">
                                        Weight (kg)
                                    </Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        step="0.01"
                                        value={data.weight}
                                        onChange={(e) => setData('weight', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
                                        className="mt-1 bg-gray-50 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:focus:border-teal-400 dark:focus:ring-teal-400/30"
                                        placeholder="Enter weight"
                                    />
                                    {errors.weight && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.weight}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="height" className="text-gray-700 dark:text-gray-200">
                                        Height (cm)
                                    </Label>
                                    <Input
                                        id="height"
                                        type="number"
                                        step="0.01"
                                        value={data.height}
                                        onChange={(e) => setData('height', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
                                        className="mt-1 bg-gray-50 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:focus:border-teal-400 dark:focus:ring-teal-400/30"
                                        placeholder="Enter height"
                                    />
                                    {errors.height && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.height}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="bmi" className="text-gray-700 dark:text-gray-200">
                                        BMI (auto-calculated)
                                    </Label>
                                    <Input
                                        id="bmi"
                                        type="text"
                                        value={data.bmi}
                                        readOnly
                                        className="mt-1 w-full cursor-not-allowed rounded-md border bg-gray-100 font-semibold text-gray-900 dark:bg-gray-600 dark:text-gray-100"
                                    />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Calculated automatically from weight and height</p>
                                </div>
                            </div>
                        </div>

                        {/* Nutrition Status */}
                        <div className="form-section rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 dark:border-gray-700 dark:from-teal-900/20 dark:to-cyan-900/20">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Nutrition Status</h2>
                            </div>
                            <div className="p-6">
                                <Label htmlFor="nutrition_status" className="text-gray-700 dark:text-gray-200">
                                    Nutrition Status
                                </Label>
                                <Input
                                    id="nutrition_status"
                                    type="text"
                                    value={data.nutrition_status}
                                    readOnly
                                    className="mt-1 w-full cursor-not-allowed rounded-md border bg-gray-100 font-semibold text-gray-900 dark:bg-gray-600 dark:text-gray-100"
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Calculated automatically after saving based on WHO growth standards
                                </p>
                            </div>
                        </div>

                        {/* Supplementary Programs */}
                        <div className="form-section rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 dark:border-gray-700 dark:from-teal-900/20 dark:to-cyan-900/20">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Supplementary Programs</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="micronutrient_powder" className="text-gray-700 dark:text-gray-200">
                                        Micronutrient Powder (MNP)
                                    </Label>
                                    <Input
                                        id="micronutrient_powder"
                                        type="text"
                                        value={data.micronutrient_powder}
                                        onChange={(e) => setData('micronutrient_powder', e.target.value)}
                                        className="mt-1 bg-gray-50 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:focus:border-teal-400 dark:focus:ring-teal-400/30"
                                        placeholder="Enter details"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="complementary_food" className="text-gray-700 dark:text-gray-200">
                                        Complementary Food
                                    </Label>
                                    <Input
                                        id="complementary_food"
                                        type="text"
                                        value={data.complementary_food}
                                        onChange={(e) => setData('complementary_food', e.target.value)}
                                        className="mt-1 bg-gray-50 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:focus:border-teal-400 dark:focus:ring-teal-400/30"
                                        placeholder="Enter details"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="ruf" className="text-gray-700 dark:text-gray-200">
                                        RUTF (Severely Wasted)
                                    </Label>
                                    <Input
                                        id="ruf"
                                        type="text"
                                        value={data.ruf}
                                        onChange={(e) => setData('ruf', e.target.value)}
                                        className="mt-1 bg-gray-50 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:focus:border-teal-400 dark:focus:ring-teal-400/30"
                                        placeholder="Enter details"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="rusf" className="text-gray-700 dark:text-gray-200">
                                        RUSF (Moderately Wasted)
                                    </Label>
                                    <Input
                                        id="rusf"
                                        type="text"
                                        value={data.rusf}
                                        onChange={(e) => setData('rusf', e.target.value)}
                                        className="mt-1 bg-gray-50 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:focus:border-teal-400 dark:focus:ring-teal-400/30"
                                        placeholder="Enter details"
                                    />
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div className="border-t border-gray-100 bg-gradient-to-r from-teal-50/50 to-cyan-50/50 px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
                                <div className="space-y-4">
                                    {/* Vaccines */}
                                    {vaccines.length > 0 && (
                                        <div>
                                            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Vaccines</h3>
                                            <div className="flex flex-wrap gap-6">
                                                {vaccines.map((vaccine) => (
                                                    <label
                                                        key={vaccine.id}
                                                        className="flex cursor-pointer items-center gap-2 rounded-md p-2 transition-colors hover:bg-white dark:hover:bg-gray-700"
                                                    >
                                                        <Checkbox
                                                            id={`vaccine_${vaccine.id}`}
                                                            checked={data.vaccine_ids.includes(vaccine.id)}
                                                            onCheckedChange={(checked) => {
                                                                setData(
                                                                    'vaccine_ids',
                                                                    checked
                                                                        ? [...data.vaccine_ids, vaccine.id]
                                                                        : data.vaccine_ids.filter((id) => id !== vaccine.id),
                                                                );
                                                            }}
                                                            className="border-teal-300 data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600 dark:border-teal-600 dark:data-[state=checked]:border-teal-400 dark:data-[state=checked]:bg-teal-500"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{vaccine.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Vitamins */}
                                    {vitamins.length > 0 && (
                                        <div>
                                            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Vitamins</h3>
                                            <div className="flex flex-wrap gap-6">
                                                {vitamins.map((vitamin) => (
                                                    <label
                                                        key={vitamin.id}
                                                        className="flex cursor-pointer items-center gap-2 rounded-md p-2 transition-colors hover:bg-white dark:hover:bg-gray-700"
                                                    >
                                                        <Checkbox
                                                            id={`vitamin_${vitamin.id}`}
                                                            checked={data.vitamin_ids.includes(vitamin.id)}
                                                            onCheckedChange={(checked) => {
                                                                setData(
                                                                    'vitamin_ids',
                                                                    checked
                                                                        ? [...data.vitamin_ids, vitamin.id]
                                                                        : data.vitamin_ids.filter((id) => id !== vitamin.id),
                                                                );
                                                            }}
                                                            className="border-teal-300 data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600 dark:border-teal-600 dark:data-[state=checked]:border-teal-400 dark:data-[state=checked]:bg-teal-500"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{vitamin.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Deworming */}
                                    <div>
                                        <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Other</h3>
                                        <div className="flex flex-wrap gap-6">
                                            <label className="flex cursor-pointer items-center gap-2 rounded-md p-2 transition-colors hover:bg-white dark:hover:bg-gray-700">
                                                <Checkbox
                                                    id="deworming"
                                                    checked={data.deworming}
                                                    onCheckedChange={(checked) => setData('deworming', checked as boolean)}
                                                    className="border-teal-300 data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600 dark:border-teal-600 dark:data-[state=checked]:border-teal-400 dark:data-[state=checked]:bg-teal-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Deworming</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="fade-in-up flex flex-wrap gap-3" style={{ animationDelay: '0.3s' }}>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-5 text-lg font-bold text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg disabled:opacity-50"
                            >
                                {processing ? 'Updating...' : 'Update Health Log'}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    const childId = healthlog.child_id ?? healthlog.child?.id;
                                    const childSlug = healthlog.child?.slug ?? childId;
                                    if (childId) {
                                        router.visit(route('children.show', { child: childSlug }));
                                    } else {
                                        router.visit(route('children.index'));
                                    }
                                }}
                                className="px-8 py-5 text-lg font-bold"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Cancel & Go to Child Profile
                            </Button>

                            {childId && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit(route('children.show', { child: childSlug }))}
                                    className="px-8 py-5 text-lg font-bold"
                                >
                                    Cancel & Go to Profile
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
