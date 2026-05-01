import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type Vaccine = {
    id: number;
    name: string;
    description: string | null;
    children_count: number;
    created_by: string | null;
    created_at: string;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Vaccines', href: '/vaccines' }];

export default function Index({ vaccines }: { vaccines: Vaccine[] }) {
    const [showModal, setShowModal] = useState(false);
    const [editingVaccine, setEditingVaccine] = useState<Vaccine | null>(null);
    const [search, setSearch] = useState('');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    const filteredVaccines = vaccines.filter(
        (v) => v.name.toLowerCase().includes(search.toLowerCase()) || (v.description ?? '').toLowerCase().includes(search.toLowerCase()),
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingVaccine) {
            put(`/vaccines/${editingVaccine.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingVaccine(null);
                    reset();
                },
            });
        } else {
            post('/vaccines', {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const openEdit = (vaccine: Vaccine) => {
        setEditingVaccine(vaccine);
        setData('name', vaccine.name);
        setData('description', vaccine.description ?? '');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingVaccine(null);
        reset();
    };

    useEffect(() => {
        if (!showModal) {
            setEditingVaccine(null);
            reset();
        }
    }, [showModal]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vaccine Catalog" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Vaccine Catalog</h1>
                        <p className="text-gray-600">Manage available vaccines for child vaccination tracking.</p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        Add Vaccine
                    </button>
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search vaccines..."
                        className="w-full max-w-md rounded border px-4 py-2"
                    />
                </div>

                <div className="overflow-x-auto rounded-lg bg-white shadow">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Description</th>
                                <th className="px-4 py-3 text-center">Children</th>
                                <th className="px-4 py-3 text-left">Added By</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVaccines.length > 0 ? (
                                filteredVaccines.map((v) => (
                                    <tr key={v.id} className="border-t hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{v.name}</td>
                                        <td className="px-4 py-3">{v.description ?? '-'}</td>
                                        <td className="px-4 py-3 text-center">{v.children_count}</td>
                                        <td className="px-4 py-3">{v.created_by ?? '-'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => openEdit(v)} className="text-sm text-blue-600 hover:underline">
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Delete vaccine "${v.name}"? This will also remove it from all children.`)) {
                                                            router.delete(`/vaccines/${v.id}`);
                                                        }
                                                    }}
                                                    className="text-sm text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                        {search ? 'No vaccines match your search.' : 'No vaccines yet. Add one to get started.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeModal}>
                    <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-4 text-xl font-bold">{editingVaccine ? 'Edit Vaccine' : 'Add Vaccine'}</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block font-medium">Vaccine Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded border px-3 py-2"
                                    placeholder="e.g., BCG, Pentavalent"
                                />
                                {errors.name && <p className="text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block font-medium">Description (optional)</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full rounded border px-3 py-2"
                                    rows={3}
                                    placeholder="Optional description..."
                                />
                                {errors.description && <p className="text-red-600">{errors.description}</p>}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : editingVaccine ? 'Update' : 'Add'}
                                </button>
                                <button type="button" onClick={closeModal} className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
