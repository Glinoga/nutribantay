import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

type Child = {
  id: number;
  name: string;
  sex: string;
  age: number;
  weight?: number;
  height?: number;
  address: string;
  contactnumber: number;
  created_by?: string; // ✅ just a name now
};

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Children Records',
    href: '/children',
  },
];

interface Props {
  children: Child[];
}

type AuthProps = {
  auth?: {
    user?: { id: number; name: string; email: string };
    roles?: string[];
  };
};

export default function Index({ children }: Props) {
  const { auth } = usePage<AuthProps>().props;

  const isAdmin = (auth?.roles ?? []).some((r) => r.toLowerCase() === 'admin');
  const isSuperAdmin = (auth?.roles ?? []).some((r) => r.toLowerCase() === 'super-admin');
  const isHealthworker = (auth?.roles ?? []).some((r) => r.toLowerCase() === 'healthworker');

  // Only healthworkers can manage (add/edit/delete)
  const canManageChildren = isHealthworker;

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

      <table className="min-w-full overflow-hidden rounded border">
        <thead className="bg-gray-50">
          <tr>
            <th className="border px-4 py-2 text-left">ID</th>
            <th className="border px-4 py-2 text-left">Name</th>
            <th className="border px-4 py-2 text-left">Sex</th>
            <th className="border px-4 py-2 text-left">Age</th>
            <th className="border px-4 py-2 text-left">Weight</th>
            <th className="border px-4 py-2 text-left">Height</th>
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
              <td className="border px-4 py-2">{child.name}</td>
              <td className="border px-4 py-2">{child.sex}</td>
              <td className="border px-4 py-2">{child.age}</td>
              <td className="border px-4 py-2">{child.address}</td>
              <td className="border px-4 py-2">{child.contactnumber}</td>
              <td className="border px-4 py-2">{child.weight ?? '-'}</td>
              <td className="border px-4 py-2">{child.height ?? '-'}</td>
              <td className="border px-4 py-2">{child.created_by ?? 'N/A'}</td>
              <td className="border px-4 py-2">
                {/* ✅ Everyone can view */}
                <Link
                  href={`/children/${child.id}`}
                  className="mr-2 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                >
                  View
                </Link>

                {/* ✅ Only healthworkers can edit/delete */}
                {canManageChildren && (
                  <>
                    <Link
                      href={`/children/${child.id}/edit`}
                      className="mr-2 rounded bg-green-500 px-3 py-1 text-white transition hover:bg-green-600"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this child profile?')) {
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
    </AppLayout>
  );
}

