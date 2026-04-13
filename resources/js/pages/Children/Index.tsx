import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { readExcel } from '@/utils/excel';
import { Head, Link, router, usePage } from '@inertiajs/react';

type Child = {
    id: number;
    fullname: string;
    first_name: string;
    middle_initial?: string | null;
    last_name: string;
    sex: string;
    age: number | null;
    weight?: number | null;
    height?: number | null;
    address?: string | null;
    contact_number?: string | null;
    barangay?: string | null;
    creator?: { name: string | null };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Children Records',
        href: '/children',
    },
];

type AuthProps = {
    auth?: {
        user?: { id: number; name: string; email: string; barangay?: string };
        roles?: string[];
    };
};

export default function Index({ children }: { children: Child[] }) {
    const { auth } = usePage<AuthProps>().props;

    const roles = auth?.roles ?? [];
    const isHealthworker = roles.includes('Healthworker');
    const canManageChildren = isHealthworker;

    // 🔥 FULLY FIXED IMPORT FUNCTION
    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('🔥 HANDLE IMPORT RUNNING');

        const file = e.target.files?.[0];
        console.log('📂 FILE:', file);

        if (!file) {
            alert('No file selected');
            return;
        }

        try {
            const rawData = await readExcel(file);

            console.log('📊 RAW DATA:', rawData);

            if (!rawData || rawData.length === 0) {
                alert('Excel file is empty or not readable');
                return;
            }

            console.log('🧠 SAMPLE ROW:', rawData[0]);

            // Convert Excel serial date to YYYY-MM-DD
            const excelToDate = (serial: number | undefined) => {
                if (!serial) return null;
                const date = new Date((serial - 25569) * 86400 * 1000);
                return date.toISOString().split('T')[0];
            };

            // Parse name in format "LASTNAME, Firstname Middlename"
            const parseName = (fullName: string) => {
                if (!fullName) return { first_name: '', middle_initial: '', last_name: '' };
                const parts = fullName.split(',').map((s) => s.trim());
                const lastName = parts[0] || '';
                const firstParts = parts[1]?.split(' ') || [];
                const firstName = firstParts[0] || '';
                const middleInitial = firstParts.length > 1 ? firstParts[1][0] : '';
                return { first_name: firstName, middle_initial: middleInitial, last_name: lastName };
            };

            const formatted = rawData
                .map((row: any) => {
                    const fullName = row.fullName;
                    if (!fullName) return null;

                    const nameParts = parseName(fullName);
                    const sex = row.sex === 'M' ? 'Male' : row.sex === 'F' ? 'Female' : '';

                    return {
                        ...nameParts,
                        sex: sex,
                        age: 0,
                        weight: parseFloat(row.weight) || 0,
                        height: parseFloat(row.height) || 0,
                        birthdate: excelToDate(row.birthdate),
                    };
                })
                .filter(Boolean);

            console.log('✅ FORMATTED:', formatted);

            if (formatted.length === 0) {
                alert('No valid rows detected from Excel.');
                return;
            }

            router.post(
                '/children/import',
                {
                    data: formatted,
                },
                {
                    onSuccess: () => {
                        console.log('✅ IMPORT SUCCESS');
                        alert('Import successful!');
                        router.reload();
                    },
                    onError: (err) => {
                        console.error('❌ IMPORT ERROR:', err);
                        alert('Import failed. Check console.');
                    },
                },
            );
        } catch (err) {
            console.error('❌ ERROR READING FILE:', err);
            alert('Failed to read Excel file.');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Children Records" />

            {/* HEADER */}
            <div className="m-4 mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">Children Records</h1>

                <div className="flex gap-2">
                    {/* 🔥 FIXED INPUT */}
                    {canManageChildren && (
                        <label className="cursor-pointer rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
                            Upload Excel
                            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImport} />
                        </label>
                    )}

                    {/* ADD CHILD */}
                    {canManageChildren && (
                        <Link href="/children/create" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                            Add Child
                        </Link>
                    )}
                </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="min-w-full overflow-hidden rounded border">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="border px-4 py-2 text-left">ID</th>
                            <th className="border px-4 py-2 text-left">Full Name</th>
                            <th className="border px-4 py-2 text-left">Sex</th>
                            <th className="border px-4 py-2 text-left">Age</th>
                            <th className="border px-4 py-2 text-left">Weight (kg)</th>
                            <th className="border px-4 py-2 text-left">Height (cm)</th>
                            <th className="border px-4 py-2 text-left">Address</th>
                            <th className="border px-4 py-2 text-left">Contact Number</th>
                            <th className="border px-4 py-2 text-left">Created By</th>
                            <th className="border px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {children.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="p-4 text-center">
                                    No records found
                                </td>
                            </tr>
                        ) : (
                            children.map((child) => (
                                <tr key={child.id} className="hover:bg-gray-100">
                                    <td className="border px-4 py-2">{child.id}</td>
                                    <td className="border px-4 py-2">{child.fullname}</td>
                                    <td className="border px-4 py-2">{child.sex}</td>
                                    <td className="border px-4 py-2">{child.age ?? '-'}</td>
                                    <td className="border px-4 py-2">{child.weight ?? '-'}</td>
                                    <td className="border px-4 py-2">{child.height ?? '-'}</td>
                                    <td className="border px-4 py-2">{child.address ?? '-'}</td>
                                    <td className="border px-4 py-2">{child.contact_number ?? '-'}</td>
                                    <td className="border px-4 py-2">{child.creator?.name ?? 'N/A'}</td>
                                    <td className="border px-4 py-2">
                                        <Link href={`/children/${child.id}`} className="mr-2 rounded bg-blue-500 px-3 py-1 text-white">
                                            View
                                        </Link>
                                        {canManageChildren && (
                                            <>
                                                <Link href={`/children/${child.id}/edit`} className="mr-2 rounded bg-green-500 px-3 py-1 text-white">
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete child profile?')) {
                                                            router.delete(`/children/${child.id}`);
                                                        }
                                                    }}
                                                    className="rounded bg-red-500 px-3 py-1 text-white"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
