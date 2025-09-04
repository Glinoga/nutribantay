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
        password: '',
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

                <div className="mb-6">
                    <label className="mb-1 block font-medium">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Enter password"
                        className="w-full rounded border px-4 py-2"
                    />
                    {errors.password && <div className="mt-1 text-sm text-red-600">{errors.password}</div>}
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
