import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

type HealthLog = {
  id: number;
  child_id: number;
  user_id: number;
  weight: number | null;
  height: number | null;
  bmi: number | null;
  zscore_wfa: number | null;
  zscore_lfa: number | null;
  zscore_wfh: number | null;
  nutrition_status: string | null;
  micronutrient_powder: string | null;
  ruf: string | null;
  rusf: string | null;
  complementary_food: string | null;
  vitamin_a: boolean;
  deworming: boolean;
  vaccine_name: string | null;
  dose_number: number | null;
  date_given: string | null;
  next_due_date: string | null;
  vaccine_status: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  child_name?: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Healthlog Management',
    href: '/healthlogs',
  },
];

interface Props {
  healthlogs: HealthLog[];
}

type AuthProps = {
  auth?: {
    user?: { id: number; name: string; email: string };
    roles?: string[];
  };
};

export default function Index({ healthlogs }: Props) {
  const { auth } = usePage<AuthProps>().props;

  const isHealthworker = (auth?.roles ?? []).some((r) => r.toLowerCase() === 'healthworker');

  const canManageLogs = isHealthworker;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Health Logs" />

      <div className="m-4 mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Health Logs</h1>

        {canManageLogs && (
          <Link
            href="/healthlog/create"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Add Health Log
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full overflow-hidden rounded border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-4 py-2 text-left">ID</th>
              <th className="border px-4 py-2 text-left">Child</th>
              <th className="border px-4 py-2 text-left">Weight (kg)</th>
              <th className="border px-4 py-2 text-left">Height (cm)</th>
              <th className="border px-4 py-2 text-left">BMI</th>
              <th className="border px-4 py-2 text-left">Nutrition Status</th>
              <th className="border px-4 py-2 text-left">Micronutrient Powder</th>
              <th className="border px-4 py-2 text-left">RUF</th>
              <th className="border px-4 py-2 text-left">RUSF</th>
              <th className="border px-4 py-2 text-left">Complementary Food</th>
              <th className="border px-4 py-2 text-left">Vitamin A</th>
              <th className="border px-4 py-2 text-left">Deworming</th>
              <th className="border px-4 py-2 text-left">Vaccine</th>
              <th className="border px-4 py-2 text-left">Dose</th>
              <th className="border px-4 py-2 text-left">Date Given</th>
              <th className="border px-4 py-2 text-left">Next Due</th>
              <th className="border px-4 py-2 text-left">Vaccine Status</th>
              <th className="border px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {healthlogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{log.id}</td>
                <td className="border px-4 py-2">{log.child_name ?? `Child #${log.child_id}`}</td>
                <td className="border px-4 py-2">{log.weight ?? '-'}</td>
                <td className="border px-4 py-2">{log.height ?? '-'}</td>
                <td className="border px-4 py-2">{log.bmi ?? '-'}</td>
                <td className="border px-4 py-2">{log.nutrition_status ?? '-'}</td>
                <td className="border px-4 py-2">{log.micronutrient_powder ?? '-'}</td>
                <td className="border px-4 py-2">{log.ruf ?? '-'}</td>
                <td className="border px-4 py-2">{log.rusf ?? '-'}</td>
                <td className="border px-4 py-2">{log.complementary_food ?? '-'}</td>
                <td className="border px-4 py-2">{log.vitamin_a ? '✔️' : '❌'}</td>
                <td className="border px-4 py-2">{log.deworming ? '✔️' : '❌'}</td>
                <td className="border px-4 py-2">{log.vaccine_name ?? '-'}</td>
                <td className="border px-4 py-2">{log.dose_number ?? '-'}</td>
                <td className="border px-4 py-2">{log.date_given ?? '-'}</td>
                <td className="border px-4 py-2">{log.next_due_date ?? '-'}</td>
                <td className="border px-4 py-2">{log.vaccine_status ?? '-'}</td>

                <td className="border px-4 py-2 whitespace-nowrap">
                  <Link
                    href={`/healthlogs/${log.id}`}
                    className="mr-2 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                  >
                    View
                  </Link>

                  {canManageLogs && (
                    <>
                      <Link
                        href={`/healthlogs/${log.id}/edit`}
                        className="mr-2 rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this health log?')) {
                            router.delete(`/healthlogs/${log.id}`);
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
