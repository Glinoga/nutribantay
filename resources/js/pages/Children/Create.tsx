import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Create() {
    const { auth } = usePage<SharedData>().props; // access logged-in user

    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        sex: string;
        age: string;
        weight: string;
        height: string;
        barangay: string;
    }>({
        name: '',
        sex: 'Male',
        age: '',
        weight: '',
        height: '',
        barangay: String(auth.user.barangay || ''), // ✅ cast to string
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side validation
        if (Number(data.weight) > 200) {
            alert('Weight cannot exceed 200 kg');
            return;
        }
        if (Number(data.height) > 250) {
            alert('Height cannot exceed 250 cm');
            return;
        }

        post('/children');
    };

    return (
        <AppLayout>
            <Head title="Add Child" />
            <h1 className="mb-4 text-xl font-bold">Add Child</h1>

            <form onSubmit={submit} className="max-w-md space-y-4">
                <div>
                    <label className="block">Name</label>
                    <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full rounded border p-2" />
                    {errors.name && <div className="text-red-600">{errors.name}</div>}
                </div>

                <div>
                    <label className="block">Sex</label>
                    <select value={data.sex} onChange={(e) => setData('sex', e.target.value)} className="w-full rounded border p-2">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>

                <div>
                    <label className="block">Age</label>
                    <input type="number" value={data.age} onChange={(e) => setData('age', e.target.value)} className="w-full rounded border p-2" />
                    {errors.age && <div className="text-red-600">{errors.age}</div>}
                </div>

                <div>
                    <label className="block">Weight (kg)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={data.weight}
                        onChange={(e) => setData('weight', e.target.value)}
                        className="w-full rounded border p-2"
                    />
                    {errors.weight && <div className="text-red-600">{errors.weight}</div>}
                </div>

                <div>
                    <label className="block">Height (cm)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={data.height}
                        onChange={(e) => setData('height', e.target.value)}
                        className="w-full rounded border p-2"
                    />
                    {errors.height && <div className="text-red-600">{errors.height}</div>}
                </div>

                <button type="submit" disabled={processing} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Save
                </button>
            </form>
        </AppLayout>
    );
}
