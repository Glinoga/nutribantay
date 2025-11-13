import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';

type Stock = {
    id: number;
    barangay: string;
    item_name: string;
    category: string;
    quantity: number;
    unit?: string | null;
    expiry_date?: string | null;
};

export default function Index({ stocks }: { stocks: Stock[] }) {
    const handleDelete = async (id: number) => {
        if (!confirm('Delete this stock item?')) return;

        try {
            await axios.delete(`/stocks/${id}`);
            location.reload(); // simple approach; you can do an Inertia visit instead
        } catch (err) {
            console.error(err);
            alert('Failed to delete.');
        }
    };

    return (
        <AppLayout>
            <Head title="Stocks" />
            <div className="mx-auto max-w-4xl py-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Barangay Stocks</h1>
                    <Link href="/stocks/create" className="rounded bg-blue-600 px-4 py-2 text-white">
                        Add Stock
                    </Link>
                </div>

                <table className="min-w-full rounded border">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="border px-3 py-2 text-left">Item</th>
                            <th className="border px-3 py-2 text-left">Category</th>
                            <th className="border px-3 py-2 text-left">Quantity</th>
                            <th className="border px-3 py-2 text-left">Expiry</th>
                            <th className="border px-3 py-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-100">
                                <td className="border px-3 py-2">{s.item_name}</td>
                                <td className="border px-3 py-2">{s.category}</td>
                                <td className="border px-3 py-2">
                                    {s.quantity} {s.unit ?? ''}
                                </td>
                                <td className="border px-3 py-2">{s.expiry_date ? new Date(s.expiry_date).toLocaleDateString() : '—'}</td>
                                <td className="border px-3 py-2">
                                    <Link href={`/stocks/${s.id}/edit`} className="mr-2 rounded bg-green-600 px-2 py-1 text-white">
                                        Edit
                                    </Link>
                                    <button onClick={() => handleDelete(s.id)} className="rounded bg-red-600 px-2 py-1 text-white">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
