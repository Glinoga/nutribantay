import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';

type Stock = {
    id?: number;
    barangay?: string;
    item_name?: string;
    category?: string;
    quantity?: number | null;
    unit?: string | null;
    expiry_date?: string | null;
};

export default function Form({ stock }: { stock: Stock | null }) {
    const [form, setForm] = useState<Stock>({
        barangay: stock?.barangay ?? '',
        item_name: stock?.item_name ?? '',
        category: stock?.category ?? 'food',
        quantity: stock?.quantity ?? 0,
        unit: stock?.unit ?? '',
        expiry_date: stock?.expiry_date ?? '',
    });

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            if (stock && stock.id) {
                await axios.put(`/stocks/${stock.id}`, form);
            } else {
                await axios.post('/stocks', form);
            }
            window.location.href = '/stocks';
        } catch (err: any) {
            console.error(err);
            alert('Failed to save.');
        }
    };

    return (
        <AppLayout>
            <Head title={stock ? 'Edit Stock' : 'Add Stock'} />
            <div className="mx-auto max-w-xl py-6">
                <h1 className="mb-4 text-2xl font-bold">{stock ? 'Edit Stock' : 'Add Stock'}</h1>

                <form onSubmit={handleSubmit} className="space-y-4 rounded bg-white p-6 shadow">
                    <div>
                        <label className="block text-sm font-medium">Barangay</label>
                        <input
                            value={form.barangay}
                            onChange={(e) => setForm({ ...form, barangay: e.target.value })}
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Item Name</label>
                        <input
                            value={form.item_name}
                            onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Category</label>
                        <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="w-full rounded border px-3 py-2"
                        >
                            <option value="food">Food</option>
                            <option value="vitamin">Vitamin</option>
                            <option value="medicine">Medicine</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Quantity</label>
                        <input
                            type="number"
                            value={form.quantity}
                            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Unit (optional)</label>
                        <input
                            value={form.unit}
                            onChange={(e) => setForm({ ...form, unit: e.target.value })}
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Expiry Date (optional)</label>
                        <input
                            type="date"
                            value={form.expiry_date ?? ''}
                            onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
                            {stock ? 'Save' : 'Create'}
                        </button>
                        <Link href="/stocks" className="rounded bg-gray-200 px-4 py-2">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
