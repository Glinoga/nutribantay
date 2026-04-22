import AppLayout from '@/layouts/app-layout';
import { Inertia } from '@inertiajs/inertia';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

type Note = {
<<<<<<< Updated upstream
  id: number;
  note: string;
  created_at: string;
  author?: { name: string | null };
=======
    id: number;
    note: string;
    created_at: string;
    author?: { name: string | null };
};

type HealthLog = {
    id: number;
    weight: number | null;
    height: number | null;
    bmi: number | null;
    age_in_months: number | null;
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
    recommendation: string | null;
    created_at: string;
>>>>>>> Stashed changes
};

type Child = {
  id: number;
  fullname: string;
  first_name: string;
  middle_initial?: string | null;
  last_name: string;
  sex: string;
  age: number | null;
  weight: number | null;
  height: number | null;
  barangay: string | null;
  address: string | null;
  contact_number: string | null;
  creator?: { name: string | null };
  updater?: { name: string | null };
  created_at: string;
  updated_at: string;
  notes?: Note[];
};

export default function Show({ child }: { child: Child }) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [newNote, setNewNote] = useState('');

  const submitNote = (e: React.FormEvent) => {
    e.preventDefault();
    Inertia.post(`/children/${child.id}/notes`, { note: newNote });
    setNewNote('');
  };

  const deleteNote = (noteId: number) => {
    if (confirm('Delete this note?')) {
      Inertia.delete(`/children/${child.id}/notes/${noteId}`);
    }
  };

  return (
    <AppLayout>
      <Head title={`Child Details - ${child.fullname}`} />

      <div className="mx-auto max-w-3xl py-6">
        <h1 className="mb-6 text-2xl font-bold">Child Details</h1>

        <div className="space-y-4 rounded-lg bg-white p-6 shadow">
          <p><span className="font-semibold">Full Name:</span> {child.fullname}</p>
          <p><span className="font-semibold">Sex:</span> {child.sex}</p>
          <p><span className="font-semibold">Age:</span> {child.age ?? 'N/A'} months</p>
          <p><span className="font-semibold">Address:</span> {child.address ?? 'N/A'}</p>
          <p><span className="font-semibold">Contact Number:</span> {child.contact_number ?? 'N/A'}</p>
          <p><span className="font-semibold">Weight:</span> {child.weight ?? 'N/A'} kg</p>
          <p><span className="font-semibold">Height:</span> {child.height ?? 'N/A'} cm</p>
          <p><span className="font-semibold">Barangay:</span> {child.barangay ?? 'N/A'}</p>
          <p><span className="font-semibold">Created by:</span> {child.creator?.name ?? 'N/A'}</p>
          <p><span className="font-semibold">Updated by:</span> {child.updater?.name ?? 'N/A'}</p>
          <p><span className="font-semibold">Created at:</span> {new Date(child.created_at).toLocaleString()}</p>
          <p><span className="font-semibold">Last updated at:</span> {new Date(child.updated_at).toLocaleString()}</p>
        </div>

        <div className="mt-6 flex gap-4">
          <Link
            href={`/children/${child.id}/edit`}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Edit
          </Link>

          <Link
            href="/children"
            className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Back to List
          </Link>
        </div>

        {/* Floating Notes Button */}
        <button
          className="fixed top-36 right-4 z-50 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={() => setNotesOpen(!notesOpen)}
        >
          Notes ({child.notes?.length || 0})
        </button>

        {/* Sliding Notes Panel */}
        <div
          className={`fixed top-0 right-0 z-40 h-full w-96 bg-white shadow-lg p-4 transition-transform duration-300 ${
            notesOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <h2 className="mb-4 text-xl font-bold">Notes</h2>

          {/* Add Note */}
          <form onSubmit={submitNote} className="mb-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full rounded border p-2"
              placeholder="Add a new note..."
            />
            <button className="mt-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
              Add Note
            </button>
          </form>

<<<<<<< Updated upstream
          {/* Existing Notes */}
          {child.notes?.length ? (
            child.notes.map((note) => (
              <div key={note.id} className="mb-2 rounded bg-gray-100 p-2">
                <p>{note.note}</p>
                <small className="text-gray-500">
                  by {note.author?.name ?? 'Unknown'} on{' '}
                  {new Date(note.created_at).toLocaleString()}
                </small>
=======
                <div className="space-y-4 rounded-lg bg-white p-6 shadow">
                    <p>
                        <span className="font-semibold">Full Name:</span> {child.fullname}
                    </p>
                    <p>
                        <span className="font-semibold">Sex:</span> {child.sex}
                    </p>
                    <p>
                        <span className="font-semibold">Age:</span> {child.age ?? 'N/A'} months
                    </p>
                    <p>
                        <span className="font-semibold">Address:</span> {child.address ?? 'N/A'}
                    </p>
                    <p>
                        <span className="font-semibold">Contact Number:</span> {child.contact_number ?? 'N/A'}
                    </p>
                    <p>
                        <span className="font-semibold">Weight:</span> {child.weight ?? 'N/A'} kg
                    </p>
                    <p>
                        <span className="font-semibold">Height:</span> {child.height ?? 'N/A'} cm
                    </p>
                    <p>
                        <span className="font-semibold">Barangay:</span> {child.barangay ?? 'N/A'}
                    </p>
                    <p>
                        <span className="font-semibold">Created by:</span> {child.creator?.name ?? 'N/A'}
                    </p>
                    <p>
                        <span className="font-semibold">Updated by:</span> {child.updater?.name ?? 'N/A'}
                    </p>
                    <p>
                        <span className="font-semibold">Created at:</span>{' '}
                        {child.created_at ? `by ${child.creator?.name ?? 'Unknown'} on ${new Date(child.created_at).toLocaleString()}` : 'N/A'}
                    </p>
                    <p>
                        <span className="font-semibold">Last updated at:</span>{' '}
                        {child.updated_at ? `by ${child.updater?.name ?? 'Unknown'} on ${new Date(child.updated_at).toLocaleString()}` : 'N/A'}
                    </p>
                </div>

                <div className="mt-6 flex gap-4">
                    <Link href={`/children/${child.id}/edit`} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        Edit
                    </Link>

                    <Link href="/children" className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">
                        Back to List
                    </Link>
                </div>

                {/* Trend Charts Section */}
                {healthlogs.length > 0 && (
                    <div className="mt-8">
                        <h2 className="mb-4 text-xl font-bold">Growth Trends</h2>

                        <div className="mb-4 flex gap-2">
                            <button
                                onClick={() => setTrendRange('6months')}
                                className={`rounded px-4 py-2 ${trendRange === '6months' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                            >
                                Last 6 Months
                            </button>
                            <button
                                onClick={() => setTrendRange('1year')}
                                className={`rounded px-4 py-2 ${trendRange === '1year' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                            >
                                Last Year
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Line Chart - Weight, Height, BMI */}
                            <div className="rounded-lg bg-white p-4 shadow">
                                <h3 className="mb-2 font-semibold">Weight, Height & BMI Over Time</h3>
                                <Line
                                    data={lineChartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                            },
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: false,
                                            },
                                        },
                                    }}
                                />
                            </div>

                            {/* Doughnut Chart - Nutrition Status */}
                            <div className="rounded-lg bg-white p-4 shadow">
                                <h3 className="mb-2 font-semibold">Nutrition Status Distribution</h3>
                                {nutritionCounts.normal + nutritionCounts.underweight + nutritionCounts.overweight + nutritionCounts.stunted > 0 ? (
                                    <Doughnut
                                        data={doughnutData}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                },
                                            },
                                        }}
                                    />
                                ) : (
                                    <p className="text-gray-500">No nutrition status data available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {healthlogs.length === 0 && (
                    <div className="mt-8 rounded-lg bg-gray-100 p-6 text-center">
                        <p className="text-gray-500">No health logs yet. Add a health log to see growth trends.</p>
                    </div>
                )}

                {/* Healthlog Table Section */}
                {healthlogs.length > 0 && (
                    <div className="mt-8">
                        <h2 className="mb-4 text-xl font-bold">Health Log Records</h2>

                        <div className="overflow-x-auto rounded-lg bg-white shadow">
                            <table className="min-w-full text-xs">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border px-2 py-2 text-left">Date</th>
                                        <th className="border px-2 py-2 text-center">Age (mo)</th>
                                        <th className="border px-2 py-2 text-center">Weight (kg)</th>
                                        <th className="border px-2 py-2 text-center">Height (cm)</th>
                                        <th className="border px-2 py-2 text-center">BMI</th>
                                        <th className="border px-2 py-2 text-center">WFA</th>
                                        <th className="border px-2 py-2 text-center">LFA</th>
                                        <th className="border px-2 py-2 text-center">WFL/WFH</th>
                                        <th className="border px-2 py-2 text-center">Nutrition Status</th>
                                        <th className="border px-2 py-2 text-center">Vit A</th>
                                        <th className="border px-2 py-2 text-center">Deworm</th>
                                        <th className="border px-2 py-2 text-center">MQ</th>
                                        <th className="border px-2 py-2 text-center">RUF</th>
                                        <th className="border px-2 py-2 text-center">RUSF</th>
                                        <th className="border px-2 py-2 text-center">Comp Food</th>
                                        <th className="border px-2 py-2 text-center">Vaccine</th>
                                        <th className="border px-2 py-2 text-center">Dose</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...healthlogs].reverse().map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="border px-2 py-2 whitespace-nowrap">
                                                {log.created_at
                                                    ? new Date(log.created_at).toLocaleDateString('en-US', {
                                                          month: 'short',
                                                          day: 'numeric',
                                                          year: 'numeric',
                                                      })
                                                    : '-'}
                                            </td>
                                            <td className="border px-2 py-2 text-center">{log.age_in_months ?? '-'}</td>
                                            <td className="border px-2 py-2 text-center">{log.weight ?? '-'}</td>
                                            <td className="border px-2 py-2 text-center">{log.height ?? '-'}</td>
                                            <td className="border px-2 py-2 text-center">{log.bmi ? log.bmi.toFixed(1) : '-'}</td>
                                            <td className="border px-2 py-2 text-center">{log.status_wfa ?? '-'}</td>
                                            <td className="border px-2 py-2 text-center">{log.status_lfa ?? '-'}</td>
                                            <td className="border px-2 py-2 text-center">{log.status_wfl_wfh ?? '-'}</td>
                                            <td className="border px-2 py-2 text-center font-semibold">{log.nutrition_status ?? '-'}</td>
                                            <td className="border px-2 py-2 text-center">{log.vitamin_a ? '✓' : '-'}</td>
                                            <td className="border px-2 py-2 text-center">{log.deworming ? '✓' : '-'}</td>
                                            <td className="border px-2 py-2 text-center">{log.micronutrient_powder ?? '-'}</td>
                                            <td className="border px-2 py-2 text-center">{log.ruf ?? '-'}</td>
                                            <td className="border px-2 py-2 text-center">{log.rusf ?? '-'}</td>
                                            <td className="border px-2 py-2 text-center">{log.complementary_food ?? '-'}</td>
                                            <td className="border px-2 py-2 text-center">{log.vaccine_name ?? '-'}</td>
                                            <td className="border px-2 py-2 text-center">{log.dose_number ?? '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Floating Notes Button */}
>>>>>>> Stashed changes
                <button
                  className="mt-1 text-red-600 hover:text-red-800"
                  onClick={() => deleteNote(note.id)}
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No notes yet.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
