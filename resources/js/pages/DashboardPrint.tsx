import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

type PrintData = {
    healthlogs: Array<{
        child_name: string;
        age: number;
        sex: string;
        weight: number;
        height: number;
        bmi: number;
        nutrition_status: string;
        vitamin_a: string;
        deworming: string;
        last_visit: string;
    }>;
    summary: {
        total_children: number;
        period_start: string;
        period_end: string;
        nutrition_status: {
            normal: number;
            underweight: number;
            overweight: number;
            stunted: number;
        };
        vitamin_a_given: number;
        deworming_given: number;
    };
    barangay: string;
    generated_at: string;
};

type DashboardPrintProps = {
    period: string;
    data: PrintData;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Print View',
        href: '#',
    },
];

export default function DashboardPrint({ period, data }: DashboardPrintProps) {
    return (
        <div className="p-8">
            <Head title={`Print View - ${period}`} />

            <div className="no-print mb-6 flex items-center justify-between">
                <button onClick={() => window.print()} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Print
                </button>
                <a href="/dashboard" className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
                    Back to Dashboard
                </a>
            </div>

            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold">Nutribantay Dashboard Report</h1>
                <p className="text-lg">Barangay: {data.barangay}</p>
                <p className="text-lg capitalize">{period} Report</p>
                <p className="text-sm text-gray-600">
                    {data.summary.period_start} to {data.summary.period_end}
                </p>
            </div>

            <div className="mb-6">
                <h2 className="mb-3 text-lg font-semibold">Summary</h2>
                <table className="mb-4 w-full border-collapse border border-gray-300">
                    <tbody>
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 font-semibold">Total Children</td>
                            <td className="border border-gray-300 px-4 py-2">{data.summary.total_children}</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 font-semibold">Normal</td>
                            <td className="border border-gray-300 px-4 py-2">{data.summary.nutrition_status.normal}</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 font-semibold">Underweight</td>
                            <td className="border border-gray-300 px-4 py-2">{data.summary.nutrition_status.underweight}</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 font-semibold">Overweight</td>
                            <td className="border border-gray-300 px-4 py-2">{data.summary.nutrition_status.overweight}</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 font-semibold">Stunted</td>
                            <td className="border border-gray-300 px-4 py-2">{data.summary.nutrition_status.stunted}</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 font-semibold">Vitamin A Given</td>
                            <td className="border border-gray-300 px-4 py-2">{data.summary.vitamin_a_given}</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 font-semibold">Deworming Given</td>
                            <td className="border border-gray-300 px-4 py-2">{data.summary.deworming_given}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mb-6">
                <h2 className="mb-3 text-lg font-semibold">Children Details</h2>
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-2 py-2 text-left">Name</th>
                            <th className="border border-gray-300 px-2 py-2 text-left">Age (months)</th>
                            <th className="border border-gray-300 px-2 py-2 text-left">Sex</th>
                            <th className="border border-gray-300 px-2 py-2 text-left">Weight (kg)</th>
                            <th className="border border-gray-300 px-2 py-2 text-left">Height (cm)</th>
                            <th className="border border-gray-300 px-2 py-2 text-left">BMI</th>
                            <th className="border border-gray-300 px-2 py-2 text-left">Nutr. Status</th>
                            <th className="border border-gray-300 px-2 py-2 text-left">Vit. A</th>
                            <th className="border border-gray-300 px-2 py-2 text-left">Deworming</th>
                            <th className="border border-gray-300 px-2 py-2 text-left">Last Visit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.healthlogs.map((log, index) => (
                            <tr key={index}>
                                <td className="border border-gray-300 px-2 py-2">{log.child_name}</td>
                                <td className="border border-gray-300 px-2 py-2">{log.age}</td>
                                <td className="border border-gray-300 px-2 py-2">{log.sex}</td>
                                <td className="border border-gray-300 px-2 py-2">{log.weight}</td>
                                <td className="border border-gray-300 px-2 py-2">{log.height}</td>
                                <td className="border border-gray-300 px-2 py-2">{log.bmi}</td>
                                <td className="border border-gray-300 px-2 py-2">{log.nutrition_status}</td>
                                <td className="border border-gray-300 px-2 py-2">{log.vitamin_a}</td>
                                <td className="border border-gray-300 px-2 py-2">{log.deworming}</td>
                                <td className="border border-gray-300 px-2 py-2">{log.last_visit}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
                <p>Generated on {data.generated_at}</p>
                <p>Nutribantay - Nutrition Monitoring System</p>
            </div>
        </div>
    );
}
