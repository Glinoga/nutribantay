import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const STATUS_SHORT: Record<string, string> = {
    'Severely Underweight': 'SU',
    Underweight: 'UW',
    Normal: 'N',
    Overweight: 'OW',
    Obese: 'OB',
    'Severely Stunted': 'SS',
    Stunted: 'ST',
    Tall: 'T',
    'Severely Wasted': 'SW',
    Wasted: 'WS',
    'Overweight/Obese': 'OW',
    'Moderate Malnutrition': 'MM',
    'Severe Malnutrition': 'SM',
};

export function shortStatus(status: string | null | undefined): string {
    if (!status) return '-';
    return STATUS_SHORT[status] ?? status;
}
