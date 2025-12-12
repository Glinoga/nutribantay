import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Edit User',
        href: '/users',
    },
];

export default function Edit({ user }) {
    const { data, setData, errors, put, processing } = useForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'healthworker',
        barangay: user.barangay || '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/users/${user.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="m-4 mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">Edit User</h1>
                <Link href="/users" className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
                    Back
                </Link>
            </div>
            <form onSubmit={submit} className="mx-4 mt-8 max-w-xl">
                {/* Name */}
                <div className="mb-4">
                    <label className="mb-1 block font-medium">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Enter full name"
                        className="w-full rounded border px-4 py-2"
                        required
                    />
                    {errors.name && <div className="mt-1 text-sm text-red-600">{errors.name}</div>}
                </div>

                {/* Email */}
                <div className="mb-4">
                    <label className="mb-1 block font-medium">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="Enter email address"
                        className="w-full rounded border px-4 py-2"
                        required
                    />
                    {errors.email && <div className="mt-1 text-sm text-red-600">{errors.email}</div>}
                </div>

                {/* Role Dropdown */}
                <div className="mb-6">
                    <label className="mb-1 block font-medium">Role</label>
                    <select
                        name="role"
                        value={data.role}
                        onChange={(e) => setData('role', e.target.value)}
                        className="w-full rounded border px-4 py-2"
                    >
                        <option value="healthworker">Health Worker</option>
                        <option value="admin">Admin</option>
                    </select>
                    {errors.role && <div className="mt-1 text-sm text-red-600">{errors.role}</div>}
                </div>

                {/* Barangay */}
                <div className="mb-4">
                    <label className="mb-1 block font-medium">Barangay</label>
                    <input
                        type="text"
                        name="barangay"
                        value={data.barangay}
                        readOnly
                        className="w-full cursor-not-allowed rounded border bg-gray-100 px-4 py-2"
                    />
                    {errors.barangay && <div className="mt-1 text-sm text-red-600">{errors.barangay}</div>}
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button type="submit" className="rounded bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700" disabled={processing}>
                        {processing ? 'Saving...' : 'Save User'}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}