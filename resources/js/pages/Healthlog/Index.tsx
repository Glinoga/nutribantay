import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

type HealthLog = {
  id: number;
  child_id: number;
  user_id: number;

  age_in_months: number | null;
  weight: number | null;
  height: number | null;
  bmi: number | null;

  status_wfa: string | null;
  status_lfa: string | null;
  status_wfl_wfh: string | null;
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
  child_name?: string | null; // mapped from backend (child.fullname)
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

  // check healthworker role
  const isHealthworker = (auth?.roles ?? []).some(
    (role) => role.toLowerCase() === 'healthworker'
  );

  const canManageLogs = isHealthworker;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Health Logs" />

      <div className="m-4 mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Health Logs</h1>

        {canManageLogs && (
          <Link
            href="/healthlogs/create"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Add Health Log
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full overflow-hidden rounded border text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Child</th>
              <th className="border px-4 py-2">Age</th>
              <th className="border px-4 py-2">Weight</th>
              <th className="border px-4 py-2">Height</th>
              <th className="border px-4 py-2">BMI</th>
              <th className="border px-4 py-2">WFA</th>
              <th className="border px-4 py-2">LFA</th>
              <th className="border px-4 py-2">WFL/WFH</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">MNP</th>
              <th className="border px-4 py-2">RUF</th>
              <th className="border px-4 py-2">RUSF</th>
              <th className="border px-4 py-2">Complementary Food</th>
              <th className="border px-4 py-2">Vit A</th>
              <th className="border px-4 py-2">Deworm</th>
              <th className="border px-4 py-2">Vaccine</th>
              <th className="border px-4 py-2">Dose</th>
              <th className="border px-4 py-2">Date Given</th>
              <th className="border px-4 py-2">Next Due</th>
              <th className="border px-4 py-2">Vaccine Status</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {healthlogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-100">
                <td className="border px-4 py-2 text-center">{log.id}</td>

                {/* CHILD NAME */}
                <td className="border px-4 py-2">
                  {log.child_name ?? `Child #${log.child_id}`}
                </td>

                {/* BASIC INFO */}
                <td className="border px-4 py-2">{log.age_in_months ?? '-'}</td>
                <td className="border px-4 py-2">{log.weight ?? '-'}</td>
                <td className="border px-4 py-2">{log.height ?? '-'}</td>
                <td className="border px-4 py-2">{log.bmi ?? '-'}</td>

                {/* WHO STATUS */}
                <td className="border px-4 py-2">{log.status_wfa ?? '-'}</td>
                <td className="border px-4 py-2">{log.status_lfa ?? '-'}</td>
                <td className="border px-4 py-2">{log.status_wfl_wfh ?? '-'}</td>
                <td className="border px-4 py-2 font-semibold">
                  {log.nutrition_status ?? '-'}
                </td>

                {/* SUPPLEMENTS */}
                <td className="border px-4 py-2">{log.micronutrient_powder ?? '-'}</td>
                <td className="border px-4 py-2">{log.ruf ?? '-'}</td>
                <td className="border px-4 py-2">{log.rusf ?? '-'}</td>
                <td className="border px-4 py-2">{log.complementary_food ?? '-'}</td>

                {/* CHECKBOX FIELDS */}
                <td className="border px-4 py-2 text-center">
                  {log.vitamin_a ? '✔️' : '❌'}
                </td>
                <td className="border px-4 py-2 text-center">
                  {log.deworming ? '✔️' : '❌'}
                </td>

                {/* VACCINES */}
                <td className="border px-4 py-2">{log.vaccine_name ?? '-'}</td>
                <td className="border px-4 py-2">{log.dose_number ?? '-'}</td>
                <td className="border px-4 py-2">{log.date_given ?? '-'}</td>
                <td className="border px-4 py-2">{log.next_due_date ?? '-'}</td>
                <td className="border px-4 py-2">{log.vaccine_status ?? '-'}</td>

                {/* ACTIONS */}
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
