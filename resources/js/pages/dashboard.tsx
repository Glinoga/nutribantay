import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { router, Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

interface DashboardMessage {
    id: number;
    message: string;
    created_at: string;
}

interface DashboardProps {
    totalChildren: number;
    underweightCases: number;
    childrenVaccinated: number;
    growthData: {
        labels: string[];
        data: number[];
    };
    malnutritionData: {
        labels: string[];
        cases2023: number[];
        cases2024: number[];
    };
    dashboardMessages: DashboardMessage[];
}

export default function Dashboard({
    totalChildren,
    underweightCases,
    childrenVaccinated,
    growthData,
    malnutritionData,
    dashboardMessages: initialMessages,
}: DashboardProps) {
    const growthChartRef            = useRef<HTMLCanvasElement>(null);
    const malnutritionChartRef      = useRef<HTMLCanvasElement>(null);
    const growthChartInstance       = useRef<Chart | null>(null);
    const malnutritionChartInstance = useRef<Chart | null>(null);

    const [messages, setMessages] = useState<DashboardMessage[]>(initialMessages ?? []);

    const { data, setData, post, processing, reset, errors } = useForm({
        message: '',
    });

    useEffect(() => {
        growthChartInstance.current?.destroy();
        if (growthChartRef.current) {
            growthChartInstance.current = new Chart(growthChartRef.current, {
                type: "line",
                data: {
                    labels: growthData?.labels ?? ["1980","1985","1990","1995","2000","2005","2010","2015","2020","2025"],
                    datasets: [{
                        label: "Registered Children",
                        data: growthData?.data ?? [20000,40000,50000,70000,90000,120000,140000,160000,180000,200000],
                        borderColor: "#1E88E5",
                        backgroundColor: "rgba(30,136,229,0.15)",
                        borderWidth: 3,
                        tension: 0.3,
                        pointBackgroundColor: "#1E88E5",
                        pointBorderColor: "#ffffff",
                        pointRadius: 5,
                    }],
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } },
                },
            });
        }

        malnutritionChartInstance.current?.destroy();
        if (malnutritionChartRef.current) {
            malnutritionChartInstance.current = new Chart(malnutritionChartRef.current, {
                type: "bar",
                data: {
                    labels: malnutritionData?.labels ?? ["Village","Home","School","Health Center"],
                    datasets: [
                        {
                            label: "2023 Cases",
                            data: malnutritionData?.cases2023 ?? [420,300,250,370],
                            backgroundColor: "#FF6B6B",
                        },
                        {
                            label: "2024 Cases",
                            data: malnutritionData?.cases2024 ?? [380,350,270,400],
                            backgroundColor: "#1E88E5",
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: { legend: { position: "top" } },
                    scales: { y: { beginAtZero: true } },
                },
            });
        }

        return () => {
            growthChartInstance.current?.destroy();
            malnutritionChartInstance.current?.destroy();
        };
    }, [growthData, malnutritionData]);

    function handlePost(e: React.FormEvent) {
        e.preventDefault();
        post(route('dashboard.messages.store'), {
            preserveScroll: true,
            onSuccess: (page) => {
                const fresh = (page.props as unknown as DashboardProps).dashboardMessages;
                if (fresh) setMessages(fresh);
                reset('message');
            },
        });
    }

    function handleDelete(id: number) {
        if (!confirm('Delete this message?')) return;
        router.delete(route('dashboard.messages.destroy', id), {
            preserveScroll: true,
            onSuccess: (page) => {
                const fresh = (page.props as unknown as DashboardProps).dashboardMessages;
                if (fresh) setMessages(fresh);
            },
        });
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-4">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition border-t-4 border-blue-500">
                        <h6 className="font-semibold text-gray-500 uppercase text-sm tracking-wide">Total Registered Children</h6>
                        <h3 className="font-bold text-3xl mt-2 text-gray-800">{totalChildren ?? 0}</h3>
                    </div>
                    <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition border-t-4 border-red-500">
                        <h6 className="font-semibold text-gray-500 uppercase text-sm tracking-wide">Underweight Cases</h6>
                        <h3 className="font-bold text-3xl mt-2 text-gray-800">{underweightCases ?? 0}</h3>
                    </div>
                    <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition border-t-4 border-teal-500">
                        <h6 className="font-semibold text-gray-500 uppercase text-sm tracking-wide">Children Vaccinated</h6>
                        <h3 className="font-bold text-3xl mt-2 text-gray-800">{childrenVaccinated ?? 0}</h3>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition border-t-4 border-blue-500">
                        <h6 className="font-semibold mb-4 text-gray-700 uppercase text-sm tracking-wide">Growth Trends Over Time</h6>
                        <canvas ref={growthChartRef} className="w-full h-64"></canvas>
                    </div>
                    <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition border-t-4 border-red-500">
                        <h6 className="font-semibold mb-4 text-gray-700 uppercase text-sm tracking-wide">Malnutrition Cases</h6>
                        <canvas ref={malnutritionChartRef} className="w-full h-64"></canvas>
                    </div>
                </div>

                {/* Quick Message / Announcement Section */}
                <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition border-t-4 border-teal-500">
                    <h6 className="font-semibold mb-3 text-gray-700">Post an Announcement</h6>

                    <form onSubmit={handlePost} className="flex flex-col md:flex-row gap-3">
                        <input
                            type="text"
                            value={data.message}
                            onChange={e => setData('message', e.target.value)}
                            placeholder="Write a quick message..."
                            required
                            className="flex-1 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                            type="submit"
                            disabled={processing || !data.message.trim()}
                            className="bg-teal-800 text-white px-6 py-3 rounded-xl hover:bg-teal-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Posting...' : 'Post'}
                        </button>
                    </form>

                    {errors.message && (
                        <p className="text-red-500 text-sm mt-2">{errors.message}</p>
                    )}

                    {messages.length > 0 && (
                        <div className="mt-5 flex flex-col gap-3">
                            <h6 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recent Announcements</h6>
                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 gap-2"
                                >
                                    <p className="text-gray-800 text-sm flex-1">{m.message}</p>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(m.created_at)}</span>
                                        <button
                                            onClick={() => handleDelete(m.id)}
                                            className="text-xs text-red-400 hover:text-red-600 transition font-bold"
                                            title="Delete message"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </AppLayout>
    );
}