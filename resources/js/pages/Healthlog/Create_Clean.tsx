import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import smartToast from '@/utils/smartToast';
import { Head, Link, useForm } from '@inertiajs/react';
import { Calculator, Check, Eye, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

type Child = {
    id: number;
    fullname: string;
    sex: string;
    birthdate: string;
    weight?: number;
    height?: number;
};

type HealthLogRecord = {
    id?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    nutrition_status?: string;
    micronutrient_powder?: string;
    rutf?: string;
    rusf?: string;
    complementary_food?: string;
    vitamin_a?: boolean;
    deworming?: boolean;
    created_at?: string;
};

type LatestHealthLog = HealthLogRecord | null;
type AllHealthLogs = HealthLogRecord[];

type HealthLogForm = {
    weight: string;
    height: string;
    bmi: string;
    nutrition_status: string;
    micronutrient_powder: string;
    rutf: string;
    rusf: string;
    complementary_food: string;
    vitamin_a: boolean;
    deworming: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Children Records', href: '/children' }];

export default function Create({
    child,
    latestHealthLog,
    allHealthLogs,
}: {
    child: Child;
    latestHealthLog?: LatestHealthLog;
    allHealthLogs?: AllHealthLogs;
}) {
    const [showSuccess, setShowSuccess] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<HealthLogRecord | null>(latestHealthLog || null);
    const [showRecordSelector, setShowRecordSelector] = useState(false);

    // Use allHealthLogs or fallback to single record in array
    const records = allHealthLogs && allHealthLogs.length > 0 ? allHealthLogs : latestHealthLog ? [latestHealthLog] : [];

    const { data, setData, post, processing, errors } = useForm<HealthLogForm>({
        weight: '',
        height: '',
        bmi: '',
        nutrition_status: '',
        micronutrient_powder: '',
        rutf: '',
        rusf: '',
        complementary_food: '',
        vitamin_a: false,
        deworming: false,
    });

    // Auto-calc BMI
    useEffect(() => {
        const w = parseFloat(data.weight);
        const h = parseFloat(data.height);

        if (w > 0 && h > 0) {
            const bmiValue = w / Math.pow(h / 100, 2); // cm → meters
            setData('bmi', bmiValue.toFixed(2));
        } else {
            setData('bmi', '');
        }
    }, [data.weight, data.height, setData]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/children/${child.id}/healthlogs`, {
            onSuccess: () => {
                setShowSuccess(true);
                smartToast.success('Health log added successfully!');
            },
            onError: () => {
                smartToast.error('Failed to add health log. Please check the form.');
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                ...breadcrumbs,
                { title: child.fullname, href: `/children/${child.id}` },
                { title: 'Add Health Log', href: `/children/${child.id}/healthlogs/create` },
            ]}
        >
            <Head title={`Add Health Log - ${child.fullname}`} />

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

                @media (prefers-reduced-motion: reduce) {
                    .fade-in-up {
                        animation: none;
                        opacity: 1;
                    }

                    .form-section {
                        animation: none;
                        opacity: 1;
                    }
                }
            `}</style>

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.12),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="fade-in-up mb-6 text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-100/50 bg-white/90 px-5 py-2 shadow-lg backdrop-blur-sm">
                            <Heart className="h-5 w-5 text-teal-600" />
                            <span className="text-sm font-semibold text-teal-700">Health Log</span>
                        </div>

                        <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
                            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                                Add Health Log
                            </span>
                        </h1>
                        <p className="mx-auto max-w-xl text-gray-600">Record new health measurements for {child.fullname}</p>
                    </div>

                    {/* Success Message */}
                    {showSuccess && (
                        <div className="fade-in-up mb-6 rounded-xl border-2 border-green-200 bg-green-50 p-4 text-green-800">
                            <div className="flex items-center gap-2">
                                <Check className="h-5 w-5 text-green-600" />
                                <span className="font-medium">Health log added successfully! Redirecting...</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={submit} className="fade-in-up space-y-6" style={{ animationDelay: '0.2s' }}>
                        {/* Child Info Card */}
                        <div className="rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-lg">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4">
                                <h2 className="text-lg font-bold text-gray-900">Child Information</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-5">
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-xs font-medium text-gray-500">Full Name</p>
                                    <p className="mt-1 font-semibold text-gray-900">{child.fullname}</p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-xs font-medium text-gray-500">Sex</p>
                                    <p className="mt-1 font-semibold text-gray-900">{child.sex}</p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-xs font-medium text-gray-500">Birthdate</p>
                                    <p className="mt-1 font-semibold text-gray-900">
                                        {child.birthdate ? new Date(child.birthdate).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-xs font-medium text-gray-500">Current Weight (kg)</p>
                                    <p className="mt-1 font-semibold text-gray-900">{child.weight ?? 'N/A'}</p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-xs font-medium text-gray-500">Current Height (cm)</p>
                                    <p className="mt-1 font-semibold text-gray-900">{child.height ?? 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Record Selector */}
                        {records.length > 1 && (
                            <div className="mb-4 rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-lg">
                                <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-gray-900">Select Previous Record</h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowRecordSelector(!showRecordSelector)}
                                            className="text-sm"
                                        >
                                            {showRecordSelector ? 'Hide Records' : 'View All Records'} ({records.length})
                                        </Button>
                                    </div>
                                </div>

                                {showRecordSelector && (
                                    <div className="max-h-60 overflow-y-auto p-4">
                                        <div className="space-y-2">
                                            {records.map((record, index) => (
                                                <div
                                                    key={record.id || index}
                                                    onClick={() => {
                                                        setSelectedRecord(record);
                                                        setShowRecordSelector(false);
                                                    }}
                                                    className={`cursor-pointer rounded-lg border-l-4 p-3 transition-all duration-200 hover:bg-[#22D3EE]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0891B2] ${
                                                        selectedRecord?.id === record.id || (!selectedRecord && index === 0)
                                                            ? 'border-[#0891B2] bg-[#ECFEFF] ring-2 ring-[#0891B2]/20'
                                                            : 'border-transparent hover:border-[#22D3EE]/50'
                                                    } `}
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            setSelectedRecord(record);
                                                            setShowRecordSelector(false);
                                                        }
                                                    }}
                                                    aria-label={`Record from ${record.created_at ? new Date(record.created_at).toLocaleDateString() : 'Unknown date'}`}
                                                    aria-current={selectedRecord?.id === record.id ? 'true' : undefined}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-[#164E63]">
                                                                {record.created_at
                                                                    ? new Date(record.created_at).toLocaleDateString('en-US', {
                                                                          month: 'short',
                                                                          day: 'numeric',
                                                                          year: 'numeric',
                                                                      })
                                                                    : 'Unknown Date'}
                                                                {index === 0 && <span className="ml-2 text-xs text-teal-600">(Latest)</span>}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Weight: {record.weight ?? 'N/A'} kg | Height: {record.height ?? 'N/A'} cm
                                                            </p>
                                                        </div>
                                                        {(selectedRecord?.id === record.id || (!selectedRecord && index === 0)) && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-[#0891B2] px-2.5 py-0.5 text-xs font-medium text-white">
                                                                <Eye className="h-3 w-3" />
                                                                Viewing
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Previous Record */}
                        {selectedRecord && (
                            <div
                                className="form-section fade-in-up rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-lg"
                                style={{ animationDelay: '0.15s' }}
                            >
                                <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4">
                                    <h2 className="text-lg font-bold text-gray-900">Previous Record</h2>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Record from: {selectedRecord.created_at ? new Date(selectedRecord.created_at).toLocaleDateString() : 'N/A'}
                                        {records.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setShowRecordSelector(true)}
                                                className="ml-2 cursor-pointer text-xs text-teal-600 hover:underline"
                                            >
                                                (Switch Record)
                                            </button>
                                        )}
                                    </p>
                                </div>
                                <div className="space-y-4 p-6">
                                    {/* Measurements */}
                                    <div>
                                        <h3 className="mb-2 text-sm font-semibold text-gray-700">Measurements</h3>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                            <div className="rounded-lg bg-gray-50 p-3">
                                                <p className="text-xs font-medium text-gray-500">Weight (kg)</p>
                                                <p className="mt-1 font-semibold text-gray-900">{selectedRecord.weight ?? 'N/A'}</p>
                                            </div>
                                            <div className="rounded-lg bg-gray-50 p-3">
                                                <p className="text-xs font-medium text-gray-500">Height (cm)</p>
                                                <p className="mt-1 font-semibold text-gray-900">{selectedRecord.height ?? 'N/A'}</p>
                                            </div>
                                            <div className="rounded-lg bg-gray-50 p-3">
                                                <p className="text-xs font-medium text-gray-500">BMI</p>
                                                <p className="mt-1 font-semibold text-gray-900">{selectedRecord.bmi ?? 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nutrition Status */}
                                    {selectedRecord.nutrition_status && (
                                        <div>
                                            <h3 className="mb-2 text-sm font-semibold text-gray-700">Nutrition Status</h3>
                                            <div className="rounded-lg bg-gray-50 p-3">
                                                <p className="font-semibold text-gray-900">{selectedRecord.nutrition_status}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Supplementary Programs */}
                                    <div>
                                        <h3 className="mb-2 text-sm font-semibold text-gray-700">Supplementary Programs</h3>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            {selectedRecord.micronutrient_powder && (
                                                <div className="rounded-lg bg-gray-50 p-3">
                                                    <p className="text-xs font-medium text-gray-500">MNP</p>
                                                    <p className="mt-1 font-semibold text-gray-900">{selectedRecord.micronutrient_powder}</p>
                                                </div>
                                            )}
                                            {selectedRecord.rutf && (
                                                <div className="rounded-lg bg-gray-50 p-3">
                                                    <p className="text-xs font-medium text-gray-500">RUTF</p>
                                                    <p className="mt-1 font-semibold text-gray-900">{selectedRecord.rutf}</p>
                                                </div>
                                            )}
                                            {selectedRecord.rusf && (
                                                <div className="rounded-lg bg-gray-50 p-3">
                                                    <p className="text-xs font-medium text-gray-500">RUSF</p>
                                                    <p className="mt-1 font-semibold text-gray-900">{selectedRecord.rusf}</p>
                                                </div>
                                            )}
                                            {selectedRecord.complementary_food && (
                                                <div className="rounded-lg bg-gray-50 p-3">
                                                    <p className="text-xs font-medium text-gray-500">Complementary Food</p>
                                                    <p className="mt-1 font-semibold text-gray-900">{selectedRecord.complementary_food}</p>
                                                </div>
                                            )}
                                            <div className="rounded-lg bg-gray-50 p-3">
                                                <p className="text-xs font-medium text-gray-500">Vitamin A</p>
                                                <p className="mt-1 font-semibold text-gray-900">{selectedRecord.vitamin_a ? 'Yes' : 'No'}</p>
                                            </div>
                                            <div className="rounded-lg bg-gray-50 p-3">
                                                <p className="text-xs font-medium text-gray-500">Deworming</p>
                                                <p className="mt-1 font-semibold text-gray-900">{selectedRecord.deworming ? 'Yes' : 'No'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                        className="mt-1 w-full cursor-not-allowed bg-gray-100 font-semibold text-gray-900"
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
                                    className="mt-1 w-full cursor-not-allowed bg-gray-100 font-semibold text-gray-900"
                                />
                                <p className="mt-1 text-xs text-gray-500">Calculated automatically after saving based on WHO growth standards</p>
                            </div>
                        </div>

                        {/* Supplementary Programs */}
                        <div className="form-section rounded-xl border-0 bg-white shadow-md transition-all hover:shadow-lg">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-teal-600" />
                                    <h2 className="text-lg font-bold text-gray-900">Supplementary Programs</h2>
                                </div>
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

                        {/* Buttons */}
                        <div className="fade-in-up flex gap-3" style={{ animationDelay: '0.3s' }}>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-5 text-lg font-bold text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Health Log'}
                            </Button>

                            <Button type="button" variant="outline" onClick={() => window.history.back()} className="px-8 py-5 text-lg font-bold">
                                Cancel & Go Back
                            </Button>

                            <Link href={`/children/${child.id}`}>
                                <Button type="button" variant="outline" className="px-8 py-5 text-lg font-bold">
                                    Cancel & Go to Profile
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
