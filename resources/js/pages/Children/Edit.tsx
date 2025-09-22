import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react'; // import Link

interface Child {
    id: number;
    name: string;
    sex: string;
    age: number;
    weight?: number;
    height?: number;
    barangay?: string;
    updated_by?: string;
    updated_at?: string;
}

export default function Edit({ child }: { child: Child }) {
    const { data, setData, put, processing, errors } = useForm({
        name: child.name || '',
        sex: child.sex || 'Male',
        age: String(child.age || ''),
        weight: String(child.weight ?? ''),
        height: String(child.height ?? ''),
        barangay: child.barangay || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (Number(data.weight) > 200) {
            alert('Weight cannot exceed 200 kg');
            return;
        }
        if (Number(data.height) > 250) {
            alert('Height cannot exceed 250 cm');
            return;
        }

        put(`/children/${child.id}`);
    };

    return (
        <AppLayout>
            <Head title="Edit Child" />

            <h1 className="mb-4 text-xl font-bold">Edit Child</h1>
            {/* Back Button */}
            <div className="mb-4">
                <button
                    onClick={() => window.history.back()}
                    className="mb-4 inline-block cursor-pointer rounded bg-gray-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-gray-700"
                >
                    Back
                </button>
            </div>
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

                <div>
                    {(child.updated_by || child.updated_at) && (
                        <div className="mt-6 rounded border bg-gray-50 p-3 text-sm text-gray-700">
                            <p>
                                <strong>Last Updated By:</strong> {child.updated_by ?? 'N/A'}
                            </p>
                            <p>
                                <strong>Last Updated At:</strong> {child.updated_at ? new Date(child.updated_at).toLocaleString() : 'N/A'}
                            </p>
                        </div>
                    )}
                </div>

                <button type="submit" disabled={processing} className="cursor-pointer rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                    Update
                </button>
            </form>
        </AppLayout>
    );
}
