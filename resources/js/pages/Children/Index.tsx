import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
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
  const canManageChildren = isHealthworker; // Healthworker only

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Children Records" />

      <div className="m-4 mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Children Records</h1>

        {canManageChildren && (
          <Link
            href="/children/create"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Add Child
          </Link>
        )}
      </div>

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
            {children.map((child) => (
              <tr key={child.id} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{child.id}</td>

                {/* Full name from backend accessor */}
                <td className="border px-4 py-2">{child.fullname}</td>

                <td className="border px-4 py-2">{child.sex}</td>
                <td className="border px-4 py-2">{child.age ?? '-'}</td>
                <td className="border px-4 py-2">{child.weight ?? '-'}</td>
                <td className="border px-4 py-2">{child.height ?? '-'}</td>
                <td className="border px-4 py-2">{child.address ?? '-'}</td>
                <td className="border px-4 py-2">{child.contact_number ?? '-'}</td>

                <td className="border px-4 py-2">
                  {child.creator?.name ?? 'N/A'}
                </td>

                <td className="border px-4 py-2">
                  <Link
                    href={`/children/${child.id}`}
                    className="mr-2 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                  >
                    View
                  </Link>

                  {canManageChildren && (
                    <>
                      <Link
                        href={`/children/${child.id}/edit`}
                        className="mr-2 rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => {
                          if (confirm('Delete child profile?')) {
                            router.delete(`/children/${child.id}`);
                          }
                        }}
                        className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
