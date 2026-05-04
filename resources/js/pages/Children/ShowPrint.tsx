import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Baby, Printer } from 'lucide-react';

type HealthLog = {
    weight: number | null;
    height: number | null;
    bmi: number | null;
    nutrition_status: string | null;
    vaccine_name: string | null;
    dose_number: number | null;
    date_given: string | null;
    next_due_date: string | null;
    vaccine_status: string | null;
    created_at: string | null;
};

type Child = {
    id: number;
    fullname: string;
    first_name: string;
    middle_initial: string | null;
    last_name: string;
    sex: string;
    age: number | null;
    birthdate: string | null;
    weight: number | null;
    height: number | null;
    bmi: number | null;
    barangay: string | null;
    address: string | null;
    contact_number: string | null;
    created_at: string | null;
    healthlogs: HealthLog[];
};

type ShowPrintProps = {
    child: Child;
    generated_at: string;
};

const getStatusColor = (status: string | null) => {
    if (status === 'Normal') return 'bg-green-100 text-green-800';
    if (status === 'Underweight') return 'bg-yellow-100 text-yellow-800';
    if (status === 'Overweight') return 'bg-red-100 text-red-800';
    return 'bg-orange-100 text-orange-800';
};

export default function ShowPrint({ child, generated_at }: ShowPrintProps) {
    return (
        <div className="min-h-screen bg-cyan-50 p-8 font-sans print:bg-white">
            <Head title={`${child.fullname} - Print`} />

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                    table { break-inside: auto; }
                    tr { break-inside: avoid; page-break-inside: avoid; }
                }
            `}</style>

            <div className="no-print mb-8 flex items-center justify-between">
                <Button onClick={() => window.print()} className="cursor-pointer bg-gradient-to-r from-cyan-600 to-cyan-400 text-white shadow-md">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                </Button>
                <Link href={`/children/${child.id}`}>
                    <Button variant="outline" className="cursor-pointer border-cyan-300">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Profile
                    </Button>
                </Link>
            </div>

            <div className="mb-8 text-center">
                <h1 className="mb-4 text-3xl font-bold text-cyan-900">Nutribantay</h1>
                <h2 className="text-2xl font-bold text-cyan-900">Child Profile</h2>
                <p className="mt-2 text-lg text-cyan-700">{child.fullname}</p>
                <p className="mt-1 text-sm text-cyan-700">Generated on {generated_at}</p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-cyan-200 bg-white p-6 print:bg-white">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-cyan-900">
                        <Baby className="h-5 w-5 text-cyan-600" />
                        Personal Information
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-cyan-700">Full Name:</span>
                            <span className="font-medium">{child.fullname}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-cyan-700">Age:</span>
                            <span className="font-medium">{child.age ?? '-'} months</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-cyan-700">Sex:</span>
                            <span className="font-medium">{child.sex}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-cyan-700">Birthdate:</span>
                            <span className="font-medium">{child.birthdate ?? '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-cyan-700">Barangay:</span>
                            <span className="font-medium">{child.barangay ?? '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-cyan-700">Address:</span>
                            <span className="font-medium">{child.address ?? '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-cyan-700">Contact:</span>
                            <span className="font-medium">{child.contact_number ?? '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-cyan-700">Registered:</span>
                            <span className="font-medium">{child.created_at ?? '-'}</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-cyan-200 bg-white p-6 print:bg-white">
                    <h3 className="mb-4 text-lg font-bold text-cyan-900">Current Measurements</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-cyan-700">Weight:</span>
                            <span className="font-medium">{child.weight ?? '-'} kg</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-cyan-700">Height:</span>
                            <span className="font-medium">{child.height ?? '-'} cm</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-cyan-700">BMI:</span>
                            <span className="font-medium">{child.bmi ?? '-'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {child.healthlogs.length > 0 && (
                <div className="mb-8">
                    <h3 className="mb-4 text-xl font-bold text-cyan-900">Health Logs</h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-cyan-50">
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Date</TableHead>
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Weight (kg)</TableHead>
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Height (cm)</TableHead>
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">BMI</TableHead>
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Nutr. Status</TableHead>
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Vaccine</TableHead>
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Dose</TableHead>
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Date Given</TableHead>
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Next Due</TableHead>
                                    <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {child.healthlogs.map((log, index) => (
                                    <TableRow key={index} className="hover:bg-cyan-50/50 print:text-xs">
                                        <TableCell className="px-4 py-2">{log.created_at ?? '-'}</TableCell>
                                        <TableCell className="px-4 py-2">{log.weight ?? '-'}</TableCell>
                                        <TableCell className="px-4 py-2">{log.height ?? '-'}</TableCell>
                                        <TableCell className="px-4 py-2">{log.bmi ?? '-'}</TableCell>
                                        <TableCell className="px-4 py-2">
                                            <span className={`rounded px-2 py-1 text-xs font-medium ${getStatusColor(log.nutrition_status)}`}>
                                                {log.nutrition_status ?? '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-2">{log.vaccine_name ?? '-'}</TableCell>
                                        <TableCell className="px-4 py-2">{log.dose_number ?? '-'}</TableCell>
                                        <TableCell className="px-4 py-2">{log.date_given ?? '-'}</TableCell>
                                        <TableCell className="px-4 py-2">{log.next_due_date ?? '-'}</TableCell>
                                        <TableCell className="px-4 py-2">
                                            <span
                                                className={`rounded px-2 py-1 text-xs font-medium ${
                                                    log.vaccine_status === 'overdue'
                                                        ? 'bg-red-100 text-red-800'
                                                        : log.vaccine_status === 'upcoming'
                                                          ? 'bg-yellow-100 text-yellow-800'
                                                          : 'bg-green-100 text-green-800'
                                                }`}
                                            >
                                                {log.vaccine_status ?? '-'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            <div className="mt-8 border-t border-cyan-200 pt-4 text-center text-sm text-cyan-700">
                <p>Generated on {generated_at}</p>
                <p className="mt-1 flex items-center justify-center gap-2">
                    <Baby className="h-4 w-4 text-cyan-600" />
                    Nutribantay - Nutrition Monitoring System
                </p>
            </div>
        </div>
    );
}
