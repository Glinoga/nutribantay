import React, { useEffect } from "react";
import Chart from "chart.js/auto";
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

export default function Dashboard() {
   useEffect(() => {
    // Growth Trends Line Chart
    const growthCtx = document.getElementById("growthChart") as HTMLCanvasElement;
    if (growthCtx) {
        new Chart(growthCtx, {
            type: "line",
            data: {
                labels: ["1980","1985","1990","1995","2000","2005","2010","2015","2020","2025"],
                datasets: [{
                    label: "Registered Children",
                    data: [20000, 40000, 50000, 70000, 90000, 120000, 140000, 160000, 180000, 200000],
                    borderColor: "#1E88E5", // matches Growth Trends card
                    backgroundColor: "rgba(30,136,229,0.2)",
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

    // Malnutrition Cases Bar Chart
    const malnutritionCtx = document.getElementById("malnutritionChart") as HTMLCanvasElement;
    if (malnutritionCtx) {
        new Chart(malnutritionCtx, {
            type: "bar",
            data: {
                labels: ["Village", "Home", "School", "Health Center"],
                datasets: [
                    { label: "2023 Cases", data: [420, 300, 250, 370], backgroundColor: "#FF6B6B" }, // red accent
                    { label: "2024 Cases", data: [380, 350, 270, 400], backgroundColor: "#1E88E5" }, // blue accent
                ],
            },
            options: {
                responsive: true,
                plugins: { legend: { position: "top" } },
                scales: { y: { beginAtZero: true } },
            },
        });
    }
}, []);


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-4">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition border-t-4 border-blue-500">
                    <h6 className="font-semibold text-gray-500">TOTAL REGISTERED CHILDREN</h6>
                    <h3 className="font-bold text-3xl mt-2 text-gray-800">632</h3>
                     </div>
                 <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition border-t-4 border-red-500">
                 <h6 className="font-semibold text-gray-500">UNDERWEIGHT CASES</h6>
              <h3 className="font-bold text-3xl mt-2 text-gray-800">50</h3>
             </div>
             <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition border-t-4 border-teal-500">
                <h6 className="font-semibold text-gray-500">CHILDREN VACCINATED</h6>
                 <h3 className="font-bold text-3xl mt-2 text-gray-800">353</h3>
             </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition border-t-4 border-blue-500">
        <h6 className="font-semibold mb-4 text-gray-700">GROWTH TRENDS OVER TIME</h6>
        <canvas id="growthChart" className="w-full h-64"></canvas>
    </div>
    <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition border-t-4 border-red-500">
        <h6 className="font-semibold mb-4 text-gray-700">MALNUTRITION CASES</h6>
        <canvas id="malnutritionChart" className="w-full h-64"></canvas>
            </div>
            </div>

            <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition border-t-4 border-teal-500">
    <h6 className="font-semibold mb-3 text-gray-700">Post an Announcement</h6>
    <div className="flex flex-col md:flex-row gap-3">
        <input
            id="announcement"
            type="text"
            placeholder="Create an announcement"
            className="flex-1 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
        <button className="bg-teal-800 text-white px-6 py-3 rounded-xl hover:bg-teal-900 transition">
            Post
        </button>
                </div>
        </div>


            </div>
        </AppLayout>
    );
}
