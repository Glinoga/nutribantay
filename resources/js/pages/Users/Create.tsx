import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Create',
        href: '/users',
    },
];

export default function Create() {
    const { data, setData, errors, post, processing } = useForm({
        name: '',
        email: '',
        password: '',
        role: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/users');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="m-4 mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">Create User</h1>
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

                {/* Password */}
                <div className="mb-4">
                    <label className="mb-1 block font-medium">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Enter password"
                        className="w-full rounded border px-4 py-2"
                        required
                    />
                    {errors.password && <div className="mt-1 text-sm text-red-600">{errors.password}</div>}
                </div>

                {/* Role Dropdown */}
                <div className="mb-6">
                    <label className="mb-1 block font-medium">Role</label>
                    <select
                        name="role"
                        value={data.role}
                        onChange={(e) => setData('role', e.target.value)}
                        className="w-full rounded border px-4 py-2"
                        required
                    >
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="healthworker">Health Worker</option>
                    </select>
                    {errors.role && <div className="mt-1 text-sm text-red-600">{errors.role}</div>}
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="rounded bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700" disabled={processing}>
                        {processing ? 'Saving...' : 'Save User'}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}