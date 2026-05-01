import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';

type Child = {
    id: number;
    fullname: string;
    sex: string;
    birthdate: string;
};

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
    vaccine_name: string;
    dose_number: string;
    date_given: string;
    next_due_date: string;
    vaccine_status: string;
};

export default function Create({ child }: { child: Child }) {
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

        vaccine_name: '',
        dose_number: '',
        date_given: '',
        next_due_date: '',
        vaccine_status: '',
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
    }, [data.weight, data.height]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/children/${child.id}/healthlogs`);
    };

    return (
        <AppLayout>
            <Head title="Add Health Log" />

            <div className="m-4">
                <h1 className="mb-4 text-xl font-bold">Add Health Log for {child.fullname}</h1>

                <form onSubmit={submit} className="max-w-2xl space-y-4">
                    {/* CHILD INFO */}
                    <div className="rounded bg-gray-100 p-4">
                        <p>
                            <span className="font-medium">Child:</span> {child.fullname}
                        </p>
                        <p>
                            <span className="font-medium">Sex:</span> {child.sex}
                        </p>
                        <p>
                            <span className="font-medium">Birthdate:</span> {child.birthdate ? new Date(child.birthdate).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>

                    {/* MEASUREMENTS */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block font-medium">Weight (kg)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.weight}
                                onChange={(e) => setData('weight', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                            />
                            {errors.weight && <p className="text-red-600">{errors.weight}</p>}
                        </div>

                        <div>
                            <label className="block font-medium">Height (cm)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.height}
                                onChange={(e) => setData('height', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                            />
                            {errors.height && <p className="text-red-600">{errors.height}</p>}
                        </div>

                        <div>
                            <label className="block font-medium">BMI (auto)</label>
                            <input type="text" value={data.bmi} readOnly className="w-full rounded border bg-gray-100 px-3 py-2" />
                        </div>
                    </div>

                    {/* NUTRITION STATUS */}
                    <div>
                        <label className="block font-medium">Nutrition Status</label>
                        <input value={data.nutrition_status} readOnly className="w-full rounded border bg-gray-100 px-3 py-2" />
                        <p className="mt-1 text-xs text-gray-500">Calculated automatically after saving.</p>
                    </div>

                    {/* SUPPLEMENTARY PROGRAMS */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium">Micronutrient Powder</label>
                            <input
                                value={data.micronutrient_powder}
                                onChange={(e) => setData('micronutrient_powder', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block font-medium">Complementary Food</label>
                            <input
                                value={data.complementary_food}
                                onChange={(e) => setData('complementary_food', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium">RUTF (Severely Wasted)</label>
                            <input value={data.rutf} onChange={(e) => setData('rutf', e.target.value)} className="w-full rounded border px-3 py-2" />
                        </div>

                        <div>
                            <label className="block font-medium">RUSF (Moderately Wasted)</label>
                            <input value={data.rusf} onChange={(e) => setData('rusf', e.target.value)} className="w-full rounded border px-3 py-2" />
                        </div>
                    </div>

                    {/* CHECKBOXES */}
                    <div className="mt-2 flex gap-6">
                        <label>
                            <input type="checkbox" checked={data.vitamin_a} onChange={(e) => setData('vitamin_a', e.target.checked)} /> Vitamin A
                        </label>

                        <label>
                            <input type="checkbox" checked={data.deworming} onChange={(e) => setData('deworming', e.target.checked)} /> Deworming
                        </label>
                    </div>

                    {/* VACCINATION */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium">Vaccine Name</label>
                            <input
                                value={data.vaccine_name}
                                onChange={(e) => setData('vaccine_name', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block font-medium">Dose Number</label>
                            <input
                                type="number"
                                value={data.dose_number}
                                onChange={(e) => setData('dose_number', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium">Date Given</label>
                            <input
                                type="date"
                                value={data.date_given}
                                onChange={(e) => setData('date_given', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block font-medium">Next Due Date</label>
                            <input
                                type="date"
                                value={data.next_due_date}
                                onChange={(e) => setData('next_due_date', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* BUTTONS */}
                    <div className="mt-6 flex gap-2">
                        <button type="submit" disabled={processing} className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                            {processing ? 'Saving...' : 'Save'}
                        </button>

                        <Link href={`/children/${child.id}`} className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
