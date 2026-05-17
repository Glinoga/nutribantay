import { route } from '@/lib/routes';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Baby, Printer } from 'lucide-react';

type Child = {
    id: number;
    fullname: string;
    first_name: string;
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
};

type Filters = {
    search?: string;
    sex?: string;
    vaccine_status?: string;
    barangay?: string;
};

type ChildrenPrintProps = {
    children: Child[];
    filters: Filters;
    generated_at: string;
};

const getFilterSummary = (filters: Filters) => {
    const parts: string[] = [];
    if (filters.search) parts.push(`Search: "${filters.search}"`);
    if (filters.sex) parts.push(`Sex: ${filters.sex}`);
    if (filters.vaccine_status) parts.push(`Vaccine: ${filters.vaccine_status}`);
    if (filters.barangay) parts.push(`Barangay: ${filters.barangay}`);
    return parts.length > 0 ? parts.join(', ') : 'All children';
};

export default function ChildrenPrint({ children, filters, generated_at }: ChildrenPrintProps) {
    return (
        <div className="min-h-screen bg-cyan-50 p-8 font-sans print:bg-white">
            <Head title="Children Records - Print" />

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                    table { break-inside: auto; }
                    tr { break-inside: avoid; page-break-inside: avoid; }
                }
            `}</style>

            <div className="no-print mb-8 flex items-center justify-between">
                <Button
                    onClick={() => window.print()}
                    className="cursor-pointer bg-gradient-to-r from-cyan-600 to-cyan-400 text-white shadow-md transition-all duration-200 hover:from-cyan-700 hover:to-cyan-500"
                >
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                </Button>
                <Link href={route('children.index')}>
                    <Button variant="outline" className="cursor-pointer border-cyan-300">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Children
                    </Button>
                </Link>
            </div>

            <div className="mb-8 text-center">
                <h1 className="mb-4 text-3xl font-bold text-cyan-900">Nutribantay</h1>
                <h2 className="text-2xl font-bold text-cyan-900">Children Records</h2>
                <p className="mt-2 text-lg text-cyan-700 capitalize">{getFilterSummary(filters)}</p>
                <p className="mt-1 text-sm text-cyan-700">Generated on {generated_at}</p>
            </div>

            <div className="mb-8">
                <div className="overflow-x-auto">
                    <Table>
                        <TableCaption className="text-cyan-700">Total: {children.length} children</TableCaption>
                        <TableHeader>
                            <TableRow className="bg-cyan-50">
                                <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Name</TableHead>
                                <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Age (mos)</TableHead>
                                <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Sex</TableHead>
                                <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Birthdate</TableHead>
                                <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Weight (kg)</TableHead>
                                <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Height (cm)</TableHead>
                                <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">BMI</TableHead>
                                <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Barangay</TableHead>
                                <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900">Contact</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {children.map((child) => (
                                <TableRow key={child.id} className="transition-colors hover:bg-cyan-50/50 print:text-xs">
                                    <TableCell className="px-4 py-2 font-medium">{child.fullname}</TableCell>
                                    <TableCell className="px-4 py-2">{child.age ?? '-'}</TableCell>
                                    <TableCell className="px-4 py-2">{child.sex}</TableCell>
                                    <TableCell className="px-4 py-2">{child.birthdate ?? '-'}</TableCell>
                                    <TableCell className="px-4 py-2">{child.weight ?? '-'}</TableCell>
                                    <TableCell className="px-4 py-2">{child.height ?? '-'}</TableCell>
                                    <TableCell className="px-4 py-2">{child.bmi ?? '-'}</TableCell>
                                    <TableCell className="px-4 py-2">{child.barangay ?? '-'}</TableCell>
                                    <TableCell className="px-4 py-2">{child.contact_number ?? '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

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
