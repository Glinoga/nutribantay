import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User',
        href: '/users',
    },
];

export default function Show({ user }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="m-4 mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">View User</h1>
                <Link href="/users" className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
                    Back
                </Link>
            </div>
            <div className="mx-4 mt-8 max-w-xl">
                <div className="mb-4">
                    <label className="mb-1 block font-medium">Name</label>
                    <input type="text" value={user.name} readOnly className="w-full rounded border bg-gray-100 px-4 py-2" />
                </div>
                <div className="mb-4">
                    <label className="mb-1 block font-medium">Email</label>
                    <input type="text" value={user.email} readOnly className="w-full rounded border bg-gray-100 px-4 py-2" />
                </div>
            </div>
        </AppLayout>
    );
}
