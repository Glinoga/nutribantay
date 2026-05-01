import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { ArcElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

type Note = {
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
    nutrition_status: string | null;
    status_wfa: string | null;
    status_lfa: string | null;
    status_wfl_wfh: string | null;
    vitamin_a: boolean;
    deworming: boolean;
    micronutrient_powder: string | null;
    ruf: string | null;
    rusf: string | null;
    complementary_food: string | null;
    vaccine_name: string | null;
    dose_number: number | null;
    date_given: string | null;
    next_due_date: string | null;
    vaccine_status: string | null;
    created_at: string;
    user?: { name: string | null };
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
    healthlogs?: HealthLog[];
};

export default function Show({ child }: { child: Child }) {
    const [notesOpen, setNotesOpen] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [trendRange, setTrendRange] = useState<'6months' | '1year'>('6months');
    const [logPage, setLogPage] = useState(1);
    const logsPerPage = 10;
    const [recommendation, setRecommendation] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { auth } = usePage<{ auth?: { roles?: string[]; user?: { roles?: string[] } } }>().props;
    const userRoles: string[] = auth?.roles ?? auth?.user?.roles ?? [];
    const isHealthworker = userRoles.some((r: string) => r.toLowerCase().replace(/[\s_]/g, '') === 'healthworker');
    const isAdmin = userRoles.some((r: string) => r.toLowerCase().replace(/[\s_]/g, '') === 'admin');
    const canManageHealthlogs = isHealthworker;
    const canViewAiRecommender = isHealthworker || isAdmin;

    // Helper function for status badge colors
    const getStatusBadgeClass = (status: string | null | undefined) => {
        const s = status || '';
        if (s === 'Normal') return 'bg-green-100 text-green-800';
        if (s.includes('Severe')) return 'bg-red-100 text-red-800';
        if (s.includes('Moderate') || s.includes('Underweight') || s.includes('Wasted') || s.includes('Stunted'))
            return 'bg-yellow-100 text-yellow-800';
        if (s.includes('Overweight') || s.includes('Obese')) return 'bg-orange-100 text-orange-800';
        if (s.includes('Tall')) return 'bg-blue-100 text-blue-800';
        return 'bg-gray-100 text-gray-800';
    };

    const submitNote = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/children/${child.id}/notes`, { note: newNote });
        setNewNote('');
    };

    const deleteNote = (noteId: number) => {
        if (confirm('Delete this note?')) {
            router.delete(`/children/${child.id}/notes/${noteId}`);
        }
    };

    const deleteHealthLog = (logId: number) => {
        if (confirm('Delete this health log?')) {
            router.delete(`/healthlogs/${logId}`, {
                onSuccess: () => {
                    router.reload({ only: ['child'] });
                },
            });
        }
    };

    const handleRecommendation = async () => {
        setLoading(true);
        setRecommendation(null);

        try {
            const response = await axios.post('/recommendations', {
                child_id: child.id,
            });
            setRecommendation(response.data.recommendation);
        } catch (error) {
            console.error(error);
            setRecommendation('⚠️ Unable to generate recommendation at this time.');
        } finally {
            setLoading(false);
        }
    };

    const healthlogs = child.healthlogs || [];

    const filteredLogs = trendRange === '6months' ? healthlogs.slice(-6) : healthlogs;

    const lineChartData = {
        labels: filteredLogs.map((log) => new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })),
        datasets: [
            {
                label: 'Weight (kg)',
                data: filteredLogs.map((log) => log.weight),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3,
            },
            {
                label: 'Height (cm)',
                data: filteredLogs.map((log) => log.height),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                tension: 0.3,
            },
            {
                label: 'BMI',
                data: filteredLogs.map((log) => log.bmi),
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.5)',
                tension: 0.3,
            },
        ],
    };

    const nutritionCounts = {
        normal: 0,
        underweight: 0,
        overweight: 0,
        stunted: 0,
    };

    filteredLogs.forEach((log) => {
        const status = log.nutrition_status || '';
        // Must check Stunted BEFORE checking for Severe/Moderate Malnutrition
        if (status === 'Normal') nutritionCounts.normal++;
        else if (['Overweight/Obese', 'Overweight', 'Obese'].includes(status)) nutritionCounts.overweight++;
        else if (['Stunted', 'Severely Stunted'].includes(status)) nutritionCounts.stunted++;
        else if (['Underweight', 'Moderate Malnutrition', 'Severe Malnutrition'].includes(status)) nutritionCounts.underweight++;
    });

    const doughnutData = {
        labels: ['Normal', 'Underweight', 'Overweight', 'Stunted'],
        datasets: [
            {
                data: [nutritionCounts.normal, nutritionCounts.underweight, nutritionCounts.overweight, nutritionCounts.stunted],
                backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(234, 179, 8, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(249, 115, 22, 0.8)'],
                borderColor: ['rgb(34, 197, 94)', 'rgb(234, 179, 8)', 'rgb(239, 68, 68)', 'rgb(249, 115, 22)'],
                borderWidth: 1,
            },
        ],
    };

    return (
        <AppLayout>
            <Head title={`Child Details - ${child.fullname}`} />

            <div className="mx-auto max-w-4xl py-6">
                <h1 className="mb-6 text-2xl font-bold">Child Details</h1>

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

                    {canViewAiRecommender && (
                        <Link
                            href={`/children/${child.id}/healthlogs/create`}
                            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        >
                            Add Health Log
                        </Link>
                    )}

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

                {/* Health Log Records Table */}
                {healthlogs.length > 0 && (
                    <div className="mt-8">
                        <h2 className="mb-4 text-xl font-bold">Health Log Records</h2>

                        <div className="overflow-x-auto rounded-lg bg-white shadow">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Date</th>
                                        <th className="px-3 py-2 text-left">Weight (kg)</th>
                                        <th className="px-3 py-2 text-left">Height (cm)</th>
                                        <th className="px-3 py-2 text-left">BMI</th>
                                        <th className="px-3 py-2 text-left">Nutrition Status</th>
                                        <th className="px-3 py-2 text-center">Status WFA</th>
                                        <th className="px-3 py-2 text-center">Status LFA</th>
                                        <th className="px-3 py-2 text-center">Status WFL</th>
                                        <th className="px-3 py-2 text-center">Vit A</th>
                                        <th className="px-3 py-2 text-center">Deworming</th>
                                        <th className="px-3 py-2 text-left">Created By</th>
                                        {canManageHealthlogs && <th className="px-3 py-2 text-center">Edit</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const sortedLogs = [...healthlogs].sort(
                                            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                                        );
                                        const paginatedLogs = sortedLogs.slice((logPage - 1) * logsPerPage, logPage * logsPerPage);

                                        return paginatedLogs.map((log) => (
                                            <tr key={log.id} className="border-t hover:bg-gray-50">
                                                <td className="px-3 py-2">
                                                    {log.created_at ? new Date(log.created_at).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-3 py-2">{log.weight ?? '-'}</td>
                                                <td className="px-3 py-2">{log.height ?? '-'}</td>
                                                <td className="px-3 py-2">{log.bmi ?? '-'}</td>
                                                <td className="px-3 py-2">
                                                    <span
                                                        className={`inline-block rounded px-2 py-0.5 text-xs ${getStatusBadgeClass(log.nutrition_status)}`}
                                                    >
                                                        {log.nutrition_status ?? '-'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <span
                                                        className={`inline-block rounded px-2 py-0.5 text-xs ${getStatusBadgeClass(log.status_wfa)}`}
                                                    >
                                                        {log.status_wfa ?? '-'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <span
                                                        className={`inline-block rounded px-2 py-0.5 text-xs ${getStatusBadgeClass(log.status_lfa)}`}
                                                    >
                                                        {log.status_lfa ?? '-'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <span
                                                        className={`inline-block rounded px-2 py-0.5 text-xs ${getStatusBadgeClass(log.status_wfl_wfh)}`}
                                                    >
                                                        {log.status_wfl_wfh ?? '-'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-center">{log.vitamin_a ? '✓' : '✗'}</td>
                                                <td className="px-3 py-2 text-center">{log.deworming ? '✓' : '✗'}</td>
                                                <td className="px-3 py-2">{log.user?.name ?? '-'}</td>
                                                {canViewAiRecommender && (
                                                    <td className="px-3 py-2 text-center">
                                                        <select
                                                            value={log.vaccine_status ?? 'Pending'}
                                                            onChange={(e) => {
                                                                if (confirm('Update vaccine status?')) {
                                                                    router.put(
                                                                        `/healthlogs/${log.id}`,
                                                                        {
                                                                            vaccine_status: e.target.value,
                                                                            _method: 'put',
                                                                        },
                                                                        {
                                                                            preserveState: true,
                                                                            preserveScroll: true,
                                                                        },
                                                                    );
                                                                }
                                                            }}
                                                            className={`rounded px-2 py-1 text-xs ${
                                                                (log.vaccine_status ?? 'Pending') === 'Completed'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : (log.vaccine_status ?? 'Pending') === 'Overdue'
                                                                      ? 'bg-red-100 text-red-800'
                                                                      : 'bg-yellow-100 text-yellow-800'
                                                            } border-0`}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="Completed">Completed</option>
                                                            <option value="Overdue">Overdue</option>
                                                        </select>
                                                    </td>
                                                )}
                                            </tr>
                                        ));
                                    })()}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {(() => {
                                const sortedLogs = [...healthlogs].sort(
                                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                                );
                                const totalPages = Math.ceil(sortedLogs.length / logsPerPage);

                                return totalPages > 1 ? (
                                    <div className="flex items-center justify-between border-t px-3 py-2">
                                        <span className="text-sm text-gray-500">
                                            Page {logPage} of {totalPages} ({sortedLogs.length} total)
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                                                disabled={logPage === 1}
                                                className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => setLogPage((p) => Math.min(totalPages, p + 1))}
                                                disabled={logPage === totalPages}
                                                className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                ) : null;
                            })()}
                        </div>
                    </div>
                )}

                {/* Vaccine Records Section */}
                <div className="mt-8">
                    <h2 className="mb-4 text-xl font-bold">Vaccine Records</h2>
                    {healthlogs.filter((log) => log.vaccine_name).length > 0 ? (
                        <div className="overflow-x-auto rounded-lg bg-white shadow">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Date Given</th>
                                        <th className="px-3 py-2 text-left">Vaccine Name</th>
                                        <th className="px-3 py-2 text-center">Dose</th>
                                        <th className="px-3 py-2 text-left">Next Due Date</th>
                                        <th className="px-3 py-2 text-center">Status</th>
                                        {canViewAiRecommender && <th className="px-3 py-2 text-center">Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {healthlogs
                                        .filter((log) => log.vaccine_name)
                                        .map((log) => (
                                            <tr key={log.id} className="border-t hover:bg-gray-50">
                                                <td className="px-3 py-2">{log.date_given ? new Date(log.date_given).toLocaleDateString() : '-'}</td>
                                                <td className="px-3 py-2 font-medium">{log.vaccine_name}</td>
                                                <td className="px-3 py-2 text-center">{log.dose_number ?? '-'}</td>
                                                <td className="px-3 py-2">
                                                    {log.next_due_date ? new Date(log.next_due_date).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <span
                                                        className={`inline-block rounded px-2 py-0.5 text-xs ${
                                                            (log.vaccine_status || 'Pending') === 'Completed'
                                                                ? 'bg-green-100 text-green-800'
                                                                : (log.vaccine_status || 'Pending') === 'Overdue'
                                                                  ? 'bg-red-100 text-red-800'
                                                                  : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                    >
                                                        {log.vaccine_status || 'Pending'}
                                                    </span>
                                                </td>
                                                {canViewAiRecommender && (
                                                    <td className="px-3 py-2 text-center">
                                                        <Link href={`/healthlogs/${log.id}/edit`} className="text-sm text-blue-600 hover:underline">
                                                            Edit
                                                        </Link>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="rounded-lg bg-gray-100 p-6 text-center">
                            <p className="text-gray-500">No vaccine records yet. Add a health log with vaccine information.</p>
                        </div>
                    )}
                </div>

                {/* AI Recommender Section */}
                {canManageHealthlogs && (
                    <div className="mt-8 rounded-lg bg-green-50 p-6 shadow">
                        <h2 className="mb-4 text-xl font-bold text-green-700">AI Nutrition Recommendation</h2>
                        <p className="mb-4 text-sm text-gray-600">
                            Generate personalized nutrition recommendations based on the child's latest health log.
                        </p>

                        <button
                            onClick={handleRecommendation}
                            disabled={loading || healthlogs.length === 0}
                            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? 'Analyzing...' : 'Generate Recommendation'}
                        </button>

                        {healthlogs.length === 0 && <p className="mt-2 text-sm text-gray-500">Add a health log first to generate recommendations.</p>}

                        {recommendation && (
                            <div className="mt-4 rounded bg-white p-4 shadow-inner">
                                <h3 className="mb-2 font-semibold">Recommendation:</h3>
                                <p className="text-sm whitespace-pre-line">{recommendation}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Floating Notes Button */}
                <button
                    className="fixed top-36 right-4 z-50 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    onClick={() => setNotesOpen(!notesOpen)}
                >
                    Notes ({child.notes?.length || 0})
                </button>

                {/* Sliding Notes Panel */}
                <div
                    className={`fixed top-0 right-0 z-40 h-full w-96 bg-white p-4 shadow-lg transition-transform duration-300 ${
                        notesOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    <h2 className="mb-4 text-xl font-bold">Notes</h2>

                    <form onSubmit={submitNote} className="mb-4">
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="w-full rounded border p-2"
                            placeholder="Add a new note..."
                        />
                        <button className="mt-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">Add Note</button>
                    </form>

                    {child.notes?.length ? (
                        child.notes.map((note) => (
                            <div key={note.id} className="mb-2 rounded bg-gray-100 p-2">
                                <p>{note.note}</p>
                                <small className="text-gray-500">
                                    {note.created_at
                                        ? `by ${note.author?.name ?? 'Unknown'} on ${new Date(note.created_at).toLocaleString()}`
                                        : 'N/A'}
                                </small>
                                <button className="mt-1 text-red-600 hover:text-red-800" onClick={() => deleteNote(note.id)}>
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
