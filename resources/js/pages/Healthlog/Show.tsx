import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

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

  child?: { fullname?: string };
  user?: { name: string };
};

export default function Show({ healthlog }: { healthlog: HealthLog }) {
  return (
    <AppLayout>
      <Head title={`Health Log #${healthlog.id}`} />

      <div className="mx-auto max-w-3xl py-6">
        <h1 className="mb-6 text-2xl font-bold">Health Log Details</h1>

        <div className="space-y-4 rounded-lg bg-white p-6 shadow">

          {/* CHILD NAME */}
          <p>
            <span className="font-semibold">Child:</span>{' '}
            {healthlog.child?.fullname ?? `Child #${healthlog.child_id}`}
          </p>

          {/* LOGGED BY */}
          <p>
            <span className="font-semibold">Logged By:</span>{' '}
            {healthlog.user?.name ?? `User #${healthlog.user_id}`}
          </p>

          {/* BASIC INFO */}
          <p>
            <span className="font-semibold">Age (months):</span>{' '}
            {healthlog.age_in_months ?? 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Weight:</span>{' '}
            {healthlog.weight ?? 'N/A'} kg
          </p>
          <p>
            <span className="font-semibold">Height:</span>{' '}
            {healthlog.height ?? 'N/A'} cm
          </p>
          <p>
            <span className="font-semibold">BMI:</span>{' '}
            {healthlog.bmi ?? 'N/A'}
          </p>

          {/* WHO NUTRITION STATUS */}
          <p>
            <span className="font-semibold">WFA Status:</span>{' '}
            {healthlog.status_wfa ?? 'N/A'}
          </p>
          <p>
            <span className="font-semibold">LFA Status:</span>{' '}
            {healthlog.status_lfa ?? 'N/A'}
          </p>
          <p>
            <span className="font-semibold">WFL/WFH Status:</span>{' '}
            {healthlog.status_wfl_wfh ?? 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Overall Nutrition Status:</span>{' '}
            {healthlog.nutrition_status ?? 'N/A'}
          </p>

          {/* SUPPLEMENTARY PROGRAMS */}
          <p>
            <span className="font-semibold">Micronutrient Powder:</span>{' '}
            {healthlog.micronutrient_powder ?? 'N/A'}
          </p>
          <p>
            <span className="font-semibold">RUF:</span>{' '}
            {healthlog.ruf ?? 'N/A'}
          </p>
          <p>
            <span className="font-semibold">RUSF:</span>{' '}
            {healthlog.rusf ?? 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Complementary Food:</span>{' '}
            {healthlog.complementary_food ?? 'N/A'}
          </p>

          {/* CHECKBOX FIELDS */}
          <p>
            <span className="font-semibold">Vitamin A:</span>{' '}
            {healthlog.vitamin_a ? 'Yes' : 'No'}
          </p>
          <p>
            <span className="font-semibold">Deworming:</span>{' '}
            {healthlog.deworming ? 'Yes' : 'No'}
          </p>

          {/* VACCINATION FIELDS */}
          <p>
            <span className="font-semibold">Vaccine Name:</span>{' '}
            {healthlog.vaccine_name ?? 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Dose Number:</span>{' '}
            {healthlog.dose_number ?? 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Date Given:</span>{' '}
            {healthlog.date_given ?? 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Next Due Date:</span>{' '}
            {healthlog.next_due_date ?? 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Vaccine Status:</span>{' '}
            {healthlog.vaccine_status ?? 'N/A'}
          </p>

          {/* SYSTEM LOGS */}
          <p>
            <span className="font-semibold">Created At:</span>{' '}
            {new Date(healthlog.created_at).toLocaleString()}
          </p>
          <p>
            <span className="font-semibold">Updated At:</span>{' '}
            {new Date(healthlog.updated_at).toLocaleString()}
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-6 flex gap-4">
          <Link
            href={`/healthlogs/${healthlog.id}/edit`}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Edit
          </Link>

          <Link
            href="/healthlogs"
            className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Back to List
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
