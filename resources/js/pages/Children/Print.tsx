import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { initializeTheme } from '@/hooks/use-appearance';
import { route } from '@/lib/routes';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Baby, Printer } from 'lucide-react';
import { useEffect } from 'react';

type Child = {
    id: number;
    fullname: string;
    sex: string;
    age: number | null;
    birthdate: string | null;
    weight: number | null;
    height: number | null;
    bmi: number | null;
    address: string | null;
    contact_number: string | null;
};

type Filters = {
    search?: string;
    sex?: string;
    vaccine_status?: string;
};

type ChildrenPrintProps = {
    children: Child[];
    filters: Filters;
    generated_at: string;
    type?: string;
};

const getFilterSummary = (filters: Filters) => {
    const parts: string[] = [];
    if (filters.search) parts.push(`Search: "${filters.search}"`);
    if (filters.sex) parts.push(`Sex: ${filters.sex}`);
    if (filters.vaccine_status) parts.push(`Vaccine: ${filters.vaccine_status}`);
    return parts.length > 0 ? parts.join(', ') : 'All children';
};

export default function ChildrenPrint({ children, filters, generated_at, type }: ChildrenPrintProps) {
    useEffect(() => {
        const handleBeforePrint = () => {
            document.documentElement.classList.remove('dark');
            document.documentElement.style.colorScheme = 'light';
        };

        const handleAfterPrint = () => {
            initializeTheme();
        };

        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('afterprint', handleAfterPrint);

        return () => {
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, []);

    return (
        <div className="min-h-screen bg-cyan-50 p-4 font-sans sm:p-6 lg:p-8 dark:bg-gray-900 print:bg-white print:text-black">
            <Head title="Children Records - Print" />

            <style>{`
                @page {
                    size: A4 landscape;
                    margin: 1.0cm;
                }
                @media print {
                    body { orphans: 3; widows: 3; }
                    .min-h-screen { min-height: 0 !important; }
                    * { print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
                    .no-print { display: none !important; }
                    
                    table { 
                        break-inside: auto; 
                        width: 100%;
                        font-size: 9pt !important;
                        border-collapse: collapse;
                    }
                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }
                    tr { break-inside: avoid; page-break-inside: avoid; }
                    
                    th, td {
                        padding: 4px 6px !important;
                        white-space: nowrap;
                    }
                    
                    th {
                        font-size: 8.5pt !important;
                        font-weight: 600 !important;
                    }
                    
                    td {
                        font-size: 9pt !important;
                    }
                }
            `}</style>

            <div className="no-print mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    onClick={() => window.print()}
                    className="cursor-pointer bg-gradient-to-r from-cyan-600 to-cyan-400 text-white shadow-md transition-all duration-200 hover:from-cyan-700 hover:to-cyan-500 dark:from-cyan-500 dark:to-cyan-300 dark:text-gray-900"
                >
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                </Button>
                <Link href={type === 'overaged' ? route('children.archived') : route('children.index')}>
                    <Button variant="outline" className="cursor-pointer border-cyan-300 dark:border-cyan-700">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {type === 'overaged' ? 'Back to Archived' : 'Back to Children'}
                    </Button>
                </Link>
            </div>

            <div className="mb-8 text-center">
                <h1 className="mb-4 text-2xl font-bold text-cyan-900 sm:text-3xl dark:text-cyan-100 print:text-black">Nutribantay</h1>
                <h2 className="text-xl font-bold text-cyan-900 sm:text-2xl dark:text-cyan-100 print:text-black">Children Records</h2>
                <p className="mt-2 text-base text-cyan-700 capitalize sm:text-lg dark:text-cyan-300 print:text-black">{getFilterSummary(filters)}</p>
                <p className="mt-1 text-sm text-cyan-700 dark:text-cyan-300 print:text-black">Generated on {generated_at}</p>
            </div>

            <div className="mb-8">
                <div className="overflow-x-auto">
                    <Table>
                        <TableCaption className="text-cyan-700 dark:text-cyan-300">Total: {children.length} children</TableCaption>
                        <TableHeader>
                            <TableRow className="bg-cyan-50 dark:bg-gray-800">
                                <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900 dark:text-cyan-100">Name</TableHead>
                                <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900 dark:text-cyan-100">Age (months)</TableHead>
                                <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900 dark:text-cyan-100">Sex</TableHead>
                                <TableHead className="hidden px-4 py-2 text-left font-semibold text-cyan-900 sm:table-cell dark:text-cyan-100">
                                    Birthdate
                                </TableHead>
                                <TableHead className="px-4 py-2 text-left font-semibold text-cyan-900 dark:text-cyan-100">Weight</TableHead>
                                <TableHead className="hidden px-4 py-2 text-left font-semibold text-cyan-900 sm:table-cell dark:text-cyan-100">
                                    Height
                                </TableHead>
                                <TableHead className="hidden px-4 py-2 text-left font-semibold text-cyan-900 sm:table-cell dark:text-cyan-100">
                                    BMI
                                </TableHead>
                                <TableHead className="hidden px-4 py-2 text-left font-semibold text-cyan-900 md:table-cell dark:text-cyan-100">
                                    Contact
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {children.map((child) => (
                                <TableRow key={child.id} className="transition-colors hover:bg-cyan-50/50 dark:hover:bg-gray-700/50 print:text-xs">
                                    <TableCell className="px-4 py-2 font-medium">
                                        <div className="flex flex-col gap-0.5">
                                            <span>{child.fullname}</span>
                                            <span className="text-xs text-cyan-700 sm:hidden dark:text-cyan-300">
                                                {child.age ?? '-'}mo · {child.weight ?? '-'}kg · {child.sex}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-2">{child.age ?? '-'}</TableCell>
                                    <TableCell className="px-4 py-2">{child.sex}</TableCell>
                                    <TableCell className="hidden px-4 py-2 sm:table-cell">{child.birthdate ?? '-'}</TableCell>
                                    <TableCell className="px-4 py-2">{child.weight ?? '-'}</TableCell>
                                    <TableCell className="hidden px-4 py-2 sm:table-cell">{child.height ?? '-'}</TableCell>
                                    <TableCell className="hidden px-4 py-2 sm:table-cell">{child.bmi ?? '-'}</TableCell>
                                    <TableCell className="hidden px-4 py-2 md:table-cell">{child.contact_number ?? '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="mt-6 border-t border-cyan-200 pt-3 text-center text-sm text-cyan-700 sm:mt-8 sm:pt-4 dark:border-gray-700 dark:text-cyan-300 print:text-black">
                <p className="print:text-black">Generated on {generated_at}</p>
                <p className="mt-1 flex items-center justify-center gap-2 print:text-black">
                    <Baby className="h-4 w-4 text-cyan-600 dark:text-cyan-400 print:text-black" />
                    Nutribantay - Nutrition Monitoring System
                </p>
            </div>
        </div>
    );
}
