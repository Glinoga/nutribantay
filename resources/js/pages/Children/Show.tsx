import AppLayout from '@/layouts/app-layout';
import { Inertia } from '@inertiajs/inertia';
import { Head, Link } from '@inertiajs/react';
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
    vitamin_a: boolean;
    deworming: boolean;
    created_at: string;
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
        if (log.nutrition_status === 'Normal') nutritionCounts.normal++;
        else if (['Underweight', 'Moderate Malnutrition', 'Severe Malnutrition'].includes(log.nutrition_status || '')) nutritionCounts.underweight++;
        else if (['Overweight', 'Obese'].includes(log.nutrition_status || '')) nutritionCounts.overweight++;
        else if (['Stunted', 'Severely Stunted'].includes(log.nutrition_status || '')) nutritionCounts.stunted++;
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
