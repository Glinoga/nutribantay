import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';

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
    const [recommendation, setRecommendation] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleRecommendation = async () => {
        setLoading(true);
        setRecommendation(null);

        try {
            const response = await axios.post('/recommendations', {
                child_id: healthlog.child_id,
                weight: healthlog.weight,
                height: healthlog.height,
                bmi: healthlog.bmi,
                nutrition_status: healthlog.nutrition_status,
            });

            setRecommendation(response.data.recommendation);
        } catch (error) {
            console.error(error);
            setRecommendation('⚠️ Unable to generate recommendation at this time.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Health Log Details" />

            <div className="mx-auto max-w-4xl space-y-6">
                <div className="space-y-4 rounded-lg bg-white p-6 shadow">
                    <p>
                        <span className="font-semibold">Child:</span> {healthlog.child?.fullname ?? `Child #${healthlog.child_id}`}
                    </p>
                    <p>
                        <span className="font-semibold">Logged By:</span> {healthlog.user?.name ?? `User #${healthlog.user_id}`}
                    </p>
                    <p>
                        <span className="font-semibold">Age (months):</span> {healthlog.age_in_months ?? 'N/A'}
                    </p>
                    <p>
                        <span className="font-semibold">Weight:</span> {healthlog.weight ?? 'N/A'} kg
                    </p>
                    <p>
                        <span className="font-semibold">Height:</span> {healthlog.height ?? 'N/A'} cm
                    </p>
                    <p>
                        <span className="font-semibold">BMI:</span> {healthlog.bmi ?? 'N/A'}
                    </p>

                    <p>
                        <span className="font-semibold">WFA Status:</span> {healthlog.status_wfa ?? 'N/A'}
                    </p>
                    <p>
                        <span className="font-semibold">LFA Status:</span> {healthlog.status_lfa ?? 'N/A'}
                    </p>
                    <p>
                        <span className="font-semibold">WFL/WFH Status:</span> {healthlog.status_wfl_wfh ?? 'N/A'}
                    </p>
                    <p>
                        <span className="font-semibold">Overall Nutrition Status:</span> {healthlog.nutrition_status ?? 'N/A'}
                    </p>

                    <p>
                        <span className="font-semibold">Vitamin A:</span> {healthlog.vitamin_a ? 'Yes' : 'No'}
                    </p>
                    <p>
                        <span className="font-semibold">Deworming:</span> {healthlog.deworming ? 'Yes' : 'No'}
                    </p>

                    <p>
                        <span className="font-semibold">Created At:</span> {new Date(healthlog.created_at).toLocaleString()}
                    </p>
                    <p>
                        <span className="font-semibold">Updated At:</span> {new Date(healthlog.updated_at).toLocaleString()}
                    </p>
                </div>

                {/* AI Recommendation */}
                <div className="rounded-lg bg-green-50 p-6 shadow">
                    <h2 className="mb-4 text-xl font-bold text-green-700">AI Recommendation</h2>

                    <button
                        onClick={handleRecommendation}
                        disabled={loading}
                        className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
                    >
                        {loading ? 'Analyzing...' : 'Generate Recommendation'}
                    </button>

                    {recommendation && (
                        <div className="mt-4 rounded bg-white p-4 shadow-inner">
                            <p className="whitespace-pre-line">{recommendation}</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    <Link href={`/healthlogs/${healthlog.id}/edit`} className="rounded bg-blue-600 px-4 py-2 text-white">
                        Edit
                    </Link>
                    <Link href="/healthlogs" className="rounded bg-gray-600 px-4 py-2 text-white">
                        Back to List
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
