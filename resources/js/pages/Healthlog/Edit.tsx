import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import smartToast from '@/utils/smartToast';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Calculator, Check, Heart, Plus, Syringe } from 'lucide-react';
import { useEffect, useState } from 'react';

type HealthLogForm = {
    weight: string | number;
    height: string | number;
    bmi: string | number;
    nutrition_status: string;
    micronutrient_powder: string;
    rutf: string;
    rusf: string;
    complementary_food: string;
    vitamin_a: boolean;
    deworming: boolean;
    vaccine_name: string;
    dose_number: string;
    date_given: string;
    next_due_date: string;
};

type HealthLog = {
    id: number;
    weight?: number | null;
    height?: number | null;
    bmi?: number | null;
    nutrition_status?: string | null;
    micronutrient_powder?: string | null;
    rutf?: string | null;
    rusf?: string | null;
    complementary_food?: string | null;
    vitamin_a?: boolean;
    deworming?: boolean;
    vaccine_name?: string | null;
    dose_number?: string | null;
    date_given?: string | null;
    next_due_date?: string | null;
    vaccine_status?: string | null;
    child_id?: number;
    child?: { fullname: string; id: number };
};

type Vaccine = {
    id: number;
    name: string;
    description: string;
};

type EditProps = {
    healthlog: HealthLog;
    child_id?: number;
    vaccines?: Vaccine[];
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Children Records', href: '/children' }];

export default function Edit({ healthlog, child_id: propChildId, vaccines = [] }: EditProps) {
    const [showSuccess, setShowSuccess] = useState(false);
    const [isOtherVaccine, setIsOtherVaccine] = useState(false);

    const { data, setData, put, processing, errors } = useForm<HealthLogForm>({
        // child_id is intentionally excluded — child-centric design, not editable
        weight: healthlog.weight ?? '',
        height: healthlog.height ?? '',
        bmi: healthlog.bmi ?? '',
        nutrition_status: healthlog.nutrition_status ?? '',

        micronutrient_powder: healthlog.micronutrient_powder ?? '',
        rutf: healthlog.rutf ?? '',
        rusf: healthlog.rusf ?? '',
        complementary_food: healthlog.complementary_food ?? '',
        vitamin_a: !!healthlog.vitamin_a,
        deworming: !!healthlog.deworming,

        vaccine_name: healthlog.vaccine_name ?? '',
        dose_number: healthlog.dose_number ?? '',
        date_given: healthlog.date_given ?? '',
        next_due_date: healthlog.next_due_date ?? '',
    });

    // Check on mount if existing vaccine_name matches any vaccine in catalog
    useEffect(() => {
        if (healthlog.vaccine_name && vaccines && vaccines.length > 0) {
            const match = vaccines.find((v) => v.name === healthlog.vaccine_name);
            setIsOtherVaccine(!match);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vaccines]);

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
        put(`/healthlogs/${healthlog.id}`, {
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
    const childName = healthlog.child?.fullname || 'Child';

    return (
        <AppLayout
            breadcrumbs={[
                ...breadcrumbs,
                { title: childName, href: `/children/${childId}` },
                { title: 'Edit Health Log', href: `/healthlogs/${healthlog.id}/edit` },
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

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.12),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="fade-in-up mb-6 text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-100/50 bg-white/90 px-5 py-2 shadow-lg backdrop-blur-sm">
                            <Heart className="h-5 w-5 text-teal-600" />
                            <span className="text-sm font-semibold text-teal-700">Edit Health Log</span>
                        </div>

                        <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
                            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                                Edit Health Log
                            </span>
                        </h1>
                        <p className="mx-auto max-w-xl text-gray-600">Update health record for {childName}</p>
                    </div>

                    {/* Data Correction Message */}
                    <div className="fade-in-up mb-6 rounded-xl border-2 border-amber-200 bg-amber-50 p-4" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                            <div className="flex-1">
                                <h3 className="font-bold text-amber-900">For Data Correction Only</h3>
                                <p className="mt-1 text-sm text-amber-800">
                                    This page is only for correcting incorrect data that was previously entered. If you want to add a new health log
                                    record for this child, please use the button below instead.
                                </p>
                                {childId && (
                                    <Link href={`/children/${childId}/healthlogs/create`}>
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
                        <div className="fade-in-up mb-6 rounded-xl border-2 border-green-200 bg-green-50 p-4 text-green-800">
                            <div className="flex items-center gap-2">
                                <Check className="h-5 w-5 text-green-600" />
                                <span className="font-medium">Health log updated successfully!</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={submit} className="fade-in-up space-y-6" style={{ animationDelay: '0.2s' }}>
                        {/* Measurements Section */}
                        <div className="form-section rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-lg">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <Calculator className="h-5 w-5 text-teal-600" />
                                    <h2 className="text-lg font-bold text-gray-900">Measurements</h2>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
                                <div>
                                    <Label htmlFor="weight" className="text-gray-700">
                                        Weight (kg)
                                    </Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        step="0.01"
                                        value={data.weight}
                                        onChange={(e) => setData('weight', e.target.value)}
                                        className="mt-1 bg-gray-50 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                        placeholder="Enter weight"
                                    />
                                    {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="height" className="text-gray-700">
                                        Height (cm)
                                    </Label>
                                    <Input
                                        id="height"
                                        type="number"
                                        step="0.01"
                                        value={data.height}
                                        onChange={(e) => setData('height', e.target.value)}
                                        className="mt-1 bg-gray-50 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                        placeholder="Enter height"
                                    />
                                    {errors.height && <p className="mt-1 text-sm text-red-600">{errors.height}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="bmi" className="text-gray-700">
                                        BMI (auto-calculated)
                                    </Label>
                                    <Input
                                        id="bmi"
                                        type="text"
                                        value={data.bmi}
                                        readOnly
                                        className="mt-1 w-full cursor-not-allowed rounded-lg border bg-gray-100 font-semibold text-gray-900"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Calculated automatically from weight and height</p>
                                </div>
                            </div>
                        </div>

                        {/* Nutrition Status */}
                        <div className="form-section rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-lg">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4">
                                <h2 className="text-lg font-bold text-gray-900">Nutrition Status</h2>
                            </div>
                            <div className="p-6">
                                <Label htmlFor="nutrition_status" className="text-gray-700">
                                    Nutrition Status
                                </Label>
                                <Input
                                    id="nutrition_status"
                                    type="text"
                                    value={data.nutrition_status}
                                    readOnly
                                    className="mt-1 w-full cursor-not-allowed rounded-lg border bg-gray-100 font-semibold text-gray-900"
                                />
                                <p className="mt-1 text-xs text-gray-500">Calculated automatically after saving based on WHO growth standards</p>
                            </div>
                        </div>

                        {/* Supplementary Programs */}
                        <div className="form-section rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-lg">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4">
                                <h2 className="text-lg font-bold text-gray-900">Supplementary Programs</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="micronutrient_powder" className="text-gray-700">
                                        Micronutrient Powder (MNP)
                                    </Label>
                                    <Input
                                        id="micronutrient_powder"
                                        type="text"
                                        value={data.micronutrient_powder}
                                        onChange={(e) => setData('micronutrient_powder', e.target.value)}
                                        className="mt-1 bg-gray-50 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                        placeholder="Enter details"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="complementary_food" className="text-gray-700">
                                        Complementary Food
                                    </Label>
                                    <Input
                                        id="complementary_food"
                                        type="text"
                                        value={data.complementary_food}
                                        onChange={(e) => setData('complementary_food', e.target.value)}
                                        className="mt-1 bg-gray-50 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                        placeholder="Enter details"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="rutf" className="text-gray-700">
                                        RUTF (Severely Wasted)
                                    </Label>
                                    <Input
                                        id="rutf"
                                        type="text"
                                        value={data.rutf}
                                        onChange={(e) => setData('rutf', e.target.value)}
                                        className="mt-1 bg-gray-50 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                        placeholder="Enter details"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="rusf" className="text-gray-700">
                                        RUSF (Moderately Wasted)
                                    </Label>
                                    <Input
                                        id="rusf"
                                        type="text"
                                        value={data.rusf}
                                        onChange={(e) => setData('rusf', e.target.value)}
                                        className="mt-1 bg-gray-50 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                        placeholder="Enter details"
                                    />
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div className="border-t border-gray-100 bg-gradient-to-r from-teal-50/50 to-cyan-50/50 px-6 py-4">
                                <div className="flex gap-6">
                                    <label className="flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors hover:bg-white">
                                        <Checkbox
                                            id="vitamin_a"
                                            checked={data.vitamin_a}
                                            onCheckedChange={(checked) => setData('vitamin_a', checked as boolean)}
                                            className="border-teal-300 data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Vitamin A Supplementation</span>
                                    </label>

                                    <label className="flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors hover:bg-white">
                                        <Checkbox
                                            id="deworming"
                                            checked={data.deworming}
                                            onCheckedChange={(checked) => setData('deworming', checked as boolean)}
                                            className="border-teal-300 data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Deworming</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Vaccination Section */}
                        <div className="form-section rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-lg">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <Syringe className="h-5 w-5 text-teal-600" />
                                    <h2 className="text-lg font-bold text-gray-900">Vaccination Record</h2>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="vaccine_name" className="text-gray-700">
                                        Vaccine Name
                                    </Label>
                                    <Select
                                        value={isOtherVaccine ? 'other' : data.vaccine_name || ''}
                                        onValueChange={(value) => {
                                            if (value === 'other') {
                                                setIsOtherVaccine(true);
                                            } else {
                                                setIsOtherVaccine(false);
                                                setData('vaccine_name', value);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="mt-1 bg-gray-50 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none">
                                            <SelectValue placeholder="Select a vaccine" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                            <SelectGroup>
                                                <SelectLabel>Vaccine Catalog</SelectLabel>
                                                {vaccines &&
                                                    vaccines.map((vaccine) => (
                                                        <SelectItem key={vaccine.id} value={vaccine.name}>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{vaccine.name}</span>
                                                                <span className="text-xs text-muted-foreground">{vaccine.description}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                            </SelectGroup>
                                            <SelectSeparator />
                                            <SelectItem value="other">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Other (Type manually)</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Free-text input for "Other" option */}
                                    {isOtherVaccine && (
                                        <div className="fade-in-up mt-2">
                                            <Input
                                                id="vaccine_name_other"
                                                type="text"
                                                value={data.vaccine_name || ''}
                                                onChange={(e) => setData('vaccine_name', e.target.value)}
                                                className="bg-gray-50 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                                placeholder="Enter vaccine name"
                                                autoFocus
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="dose_number" className="text-gray-700">
                                        Dose Number
                                    </Label>
                                    <Input
                                        id="dose_number"
                                        type="number"
                                        value={data.dose_number}
                                        onChange={(e) => setData('dose_number', e.target.value)}
                                        className="mt-1 bg-gray-50 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                        placeholder="Enter dose number"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="date_given" className="text-gray-700">
                                        Date Given
                                    </Label>
                                    <Input
                                        id="date_given"
                                        type="date"
                                        value={data.date_given}
                                        onChange={(e) => setData('date_given', e.target.value)}
                                        className="mt-1 cursor-pointer bg-gray-50 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="next_due_date" className="text-gray-700">
                                        Next Due Date
                                    </Label>
                                    <Input
                                        id="next_due_date"
                                        type="date"
                                        value={data.next_due_date}
                                        onChange={(e) => setData('next_due_date', e.target.value)}
                                        className="mt-1 cursor-pointer bg-gray-50 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Vaccine Status */}
                            <div className="border-t border-gray-100 bg-gradient-to-r from-teal-50/50 to-cyan-50/50 px-6 py-4">
                                <Label htmlFor="vaccine_status" className="text-gray-700">
                                    Vaccine Status (Auto)
                                </Label>
                                <Input
                                    id="vaccine_status"
                                    type="text"
                                    value={healthlog.vaccine_status || 'Pending'}
                                    readOnly
                                    className="mt-1 w-full cursor-not-allowed rounded-lg border bg-gray-100 font-semibold text-gray-900"
                                />
                                <p className="mt-1 text-xs text-gray-500">Status is automatically set based on Date Given and Next Due Date</p>
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
                                    if (childId) {
                                        router.visit(`/children/${childId}`);
                                    } else {
                                        router.visit('/children');
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
                                    onClick={() => router.visit(`/children/${childId}`)}
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
