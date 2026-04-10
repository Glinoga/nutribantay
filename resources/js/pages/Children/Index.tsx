import { readExcel } from "@/utils/excel";
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
  const canManageChildren = isHealthworker;

  // 🔥 FULLY FIXED IMPORT FUNCTION
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("🔥 HANDLE IMPORT RUNNING");

    const file = e.target.files?.[0];
    console.log("📂 FILE:", file);

    if (!file) {
      alert("No file selected");
      return;
    }

    try {
      const rawData = await readExcel(file);

      console.log("📊 RAW DATA:", rawData);

      if (!rawData || rawData.length === 0) {
        alert("Excel file is empty or not readable");
        return;
      }

      console.log("🧠 KEYS:", Object.keys(rawData[0]));

      const formatted = rawData
        .map((row: any) => {
          const keys = Object.keys(row);

          const fullNameKey = keys.find(k => k.toLowerCase().includes("name"));
          const sexKey = keys.find(k => k.toLowerCase().includes("sex"));
          const birthKey = keys.find(k => k.toLowerCase().includes("birth"));
          const weightKey = keys.find(k => k.toLowerCase().includes("weight"));
          const heightKey = keys.find(k => k.toLowerCase().includes("height"));

          const fullName = row[fullNameKey || ""];

          if (!fullName) return null;

          const parts = String(fullName).trim().split(" ");

          return {
            first_name: parts[0] || "",
            middle_initial: parts.length > 2 ? parts[1][0] : "",
            last_name: parts[parts.length - 1] || "",
            sex: row[sexKey || ""] || "",
            age: 0,
            weight: parseFloat(row[weightKey || ""]) || 0,
            height: parseFloat(row[heightKey || ""]) || 0,
            birthdate: row[birthKey || ""] || null,
          };
        })
        .filter(Boolean);

      console.log("✅ FORMATTED:", formatted);

      if (formatted.length === 0) {
        alert("No valid rows detected from Excel.");
        return;
      }

      router.post("/children/import", {
        data: formatted,
      }, {
        onSuccess: () => {
          console.log("✅ IMPORT SUCCESS");
          alert("Import successful!");
          router.reload();
        },
        onError: (err) => {
          console.error("❌ IMPORT ERROR:", err);
          alert("Import failed. Check console.");
        }
      });

    } catch (err) {
      console.error("❌ ERROR READING FILE:", err);
      alert("Failed to read Excel file.");
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
              <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleImport}
              />
            </label>
          )}

          {/* ADD CHILD */}
          {canManageChildren && (
            <Link
              href="/children/create"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
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
                <td colSpan={10} className="text-center p-4">
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
                  <td className="border px-4 py-2">
                    {child.creator?.name ?? 'N/A'}
                  </td>
                  <td className="border px-4 py-2">
                    <Link href={`/children/${child.id}`} className="mr-2 bg-blue-500 text-white px-3 py-1 rounded">
                      View
                    </Link>
                    {canManageChildren && (
                      <>
                        <Link href={`/children/${child.id}/edit`} className="mr-2 bg-green-500 text-white px-3 py-1 rounded">
                          Edit
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm('Delete child profile?')) {
                              router.delete(`/children/${child.id}`);
                            }
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded"
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