import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

type Child = {
    id: number;
    fullname: string;
    sex: string;
    birthdate: string;
};

export default function Create() {
    const { children } = usePage<SharedData & { children: Child[]; child?: Child }>().props;
    const childFromRoute = (usePage<SharedData>().props as any).child as Child | undefined;

    const { data, setData, post, processing, errors } = useForm({
        child_id: childFromRoute ? String(childFromRoute.id) : '',
        weight: '',
        height: '',
        bmi: '',
        nutrition_status: '',

        micronutrient_powder: '',
        ruf: '',
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

    // Auto-BMI calculator (weight kg, height cm → meters)
    useEffect(() => {
        const w = parseFloat(data.weight);
        const h = parseFloat(data.height);

        if (w > 0 && h > 0) {
            const bmiValue = w / Math.pow(h / 100, 2);
            setData('bmi', bmiValue.toFixed(2));
        } else {
            setData('bmi', '');
        }
    }, [data.weight, data.height]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (childFromRoute) {
            post(`/children/${childFromRoute.id}/healthlogs`);
        } else {
            post('/healthlogs');
        }
    };

    return (
        <AppLayout>
            <Head title="Add Health Log" />

            <div className="m-4">
                <h1 className="mb-4 text-xl font-bold">Add Health Log</h1>

                <form onSubmit={submit} className="max-w-2xl space-y-4">
                    {/* CHILD SELECT - Only show if no child from route */}
                    {childFromRoute ? (
                        <div className="rounded bg-gray-100 p-4">
                            <p>
                                <span className="font-medium">Child:</span> {childFromRoute.fullname}
                            </p>
                            <p>
                                <span className="font-medium">Sex:</span> {childFromRoute.sex}
                            </p>
                            <p>
                                <span className="font-medium">Birthdate:</span> {childFromRoute.birthdate}
                            </p>
                        </div>
                    ) : (
                        <div>
                            <label className="block font-medium">Select Child</label>
                            <select
                                name="child_id"
                                value={data.child_id}
                                onChange={(e) => setData('child_id', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                                required
                            >
                                <option value="">-- Select a child --</option>

                                {children.map((child: any) => (
                                    <option key={child.id} value={child.id}>
                                        {child.fullname || child.first_name + ' ' + child.last_name} ({child.sex}) – {child.birthdate}
                                    </option>
                                ))}
                            </select>

                            {errors.child_id && <p className="text-red-600">{errors.child_id}</p>}
                        </div>
                    )}

                    {/* MEASUREMENTS */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block font-medium">Weight (kg)</label>
                            <input
                                name="weight"
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
                                name="height"
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
                            <input
                                name="bmi"
                                type="number"
                                step="0.01"
                                value={data.bmi}
                                readOnly
                                className="w-full rounded border bg-gray-100 px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* NUTRITION STATUS */}
                    <div>
                        <label className="block font-medium">Overall Nutrition Status</label>
                        <input
                            name="nutrition_status"
                            value={data.nutrition_status}
                            readOnly
                            placeholder="Calculated after saving"
                            className="w-full rounded border bg-gray-100 px-3 py-2"
                        />
                    </div>

                    {/* SUPPLEMENTS */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium">Micronutrient Powder</label>
                            <input
                                name="micronutrient_powder"
                                value={data.micronutrient_powder}
                                onChange={(e) => setData('micronutrient_powder', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block font-medium">Complementary Food</label>
                            <input
                                name="complementary_food"
                                value={data.complementary_food}
                                onChange={(e) => setData('complementary_food', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* RUF / RUSF */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium">RUF</label>
                            <input
                                name="ruf"
                                value={data.ruf}
                                onChange={(e) => setData('ruf', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block font-medium">RUSF</label>
                            <input
                                name="rusf"
                                value={data.rusf}
                                onChange={(e) => setData('rusf', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* CHECKBOXES */}
                    <div className="flex items-center gap-6">
                        <label>
                            <input type="checkbox" checked={data.vitamin_a} onChange={(e) => setData('vitamin_a', e.target.checked)} /> Vitamin A
                        </label>

                        <label>
                            <input type="checkbox" checked={data.deworming} onChange={(e) => setData('deworming', e.target.checked)} /> Deworming
                        </label>
                    </div>

                    {/* VACCINATION */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium">Vaccine Name</label>
                            <input
                                name="vaccine_name"
                                value={data.vaccine_name}
                                onChange={(e) => setData('vaccine_name', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block font-medium">Dose Number</label>
                            <input
                                name="dose_number"
                                type="number"
                                value={data.dose_number}
                                onChange={(e) => setData('dose_number', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium">Date Given</label>
                            <input
                                name="date_given"
                                type="date"
                                value={data.date_given}
                                onChange={(e) => setData('date_given', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block font-medium">Next Due Date</label>
                            <input
                                name="next_due_date"
                                type="date"
                                value={data.next_due_date}
                                onChange={(e) => setData('next_due_date', e.target.value)}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* BUTTONS */}
                    <div className="mt-4 flex gap-2">
                        <button type="submit" disabled={processing} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                            {processing ? 'Saving...' : 'Save'}
                        </button>

                        <Link
                            href={childFromRoute ? `/children/${childFromRoute.id}` : '/healthlogs'}
                            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
