import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import toast from 'react-hot-toast'; // ✅ Import your working toast

type Child = {
  id: number;
  uid: string;
  name: string;
  sex: string;
  age: number;
  weight?: number;
  height?: number;
  created_by?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Children Records', href: '/children' },
];

interface Props {
  children: Child[];
}

export default function Index({ children }: Props) {
  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this child profile?')) {
      router.delete(`/children/${id}`, {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('🗑️ Child record deleted successfully!');
        },
        onError: () => {
          toast.error('❌ Failed to delete record. Please try again.');
        },
      });
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Children Records" />

      <div className="m-4 mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Children Records</h1>
        <Link
          href="/children/create"
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Add Child
        </Link>
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
            <th className="border px-4 py-2 text-left">Created By</th>
            <th className="border px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {children.length > 0 ? (
            children.map((child) => (
              <tr key={child.id} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{child.id}</td>
                <td className="border px-4 py-2">{child.name}</td>
                <td className="border px-4 py-2">{child.sex}</td>
                <td className="border px-4 py-2">{child.age}</td>
                <td className="border px-4 py-2">{child.weight ?? '-'}</td>
                <td className="border px-4 py-2">{child.height ?? '-'}</td>
                <td className="border px-4 py-2">{child.created_by ?? 'N/A'}</td>
                <td className="border px-4 py-2 flex gap-2">
                  <Link
                    href={`/children/${child.id}/edit`}
                    className="rounded bg-green-500 px-3 py-1 text-white transition hover:bg-green-600"
                    onClick={() => toast.success(' Edit child record')}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(child.id)}
                    className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={8}
                className="border px-4 py-6 text-center text-gray-500"
              >
                No children records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </AppLayout>
  );
}
