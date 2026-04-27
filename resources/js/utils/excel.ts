import * as XLSX from 'xlsx';

const excelDateToJSDate = (serial: number): string | null => {
    if (!serial) return null;
    const date = XLSX.SSF.parse_date_code(serial);
    if (!date) return null;
    const year = date.y;
    const month = String(date.m).padStart(2, '0');
    const day = String(date.d).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

type ExcelRow = (string | number | null | undefined)[];

export const readExcel = async (file: File) => {
    const data = await file.arrayBuffer();

    const workbook = XLSX.read(data, { type: 'array' });

    let sheet = null;
    let headerIndex = -1;

    for (const sheetName of workbook.SheetNames) {
        const tempSheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<ExcelRow>(tempSheet, { header: 1 });

        const foundIndex = rows.findIndex((row: ExcelRow) => {
            if (!row || !Array.isArray(row)) return false;
            return row.some((cell) => typeof cell === 'string' && cell.includes('Full Name of Child'));
        });

        if (foundIndex !== -1) {
            sheet = tempSheet;
            headerIndex = foundIndex;
            console.log(`Found header in sheet: ${sheetName} at row ${foundIndex + 1}`);
            break;
        }
    }

    if (!sheet || headerIndex === -1) {
        console.error('Header row not found!');
        return [];
    }

    const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { header: 1 });

    const fullNameIdx = 3;
    const sexIdx = 5;
    const birthdateIdx = 6;
    const weightIdx = 8;
    const heightIdx = 9;

    const dataRows = rows.slice(headerIndex + 2);

    const formatted = dataRows
        .filter((row: ExcelRow) => {
            const fullName = row[fullNameIdx];
            if (!fullName || typeof fullName !== 'string') return false;
            if (fullName.includes('Surname') || fullName.includes('(')) return false;
            return true;
        })
        .map((row: ExcelRow) => {
            const fullName = String(row[fullNameIdx] ?? '').trim();
            const nameParts = fullName.split(' ');
            const lastName = nameParts[0] || '';
            const firstName = nameParts.slice(1).join(' ') || '';
            const sex = String(row[sexIdx] ?? '').trim();
            const sexNormalized = sex.toUpperCase().startsWith('M') ? 'M' : 'F';
            const birthdateRaw = row[birthdateIdx];
            const birthdate = typeof birthdateRaw === 'number' ? excelDateToJSDate(birthdateRaw) : String(birthdateRaw);

            return {
                first_name: firstName,
                last_name: lastName,
                sex: sexNormalized,
                birthdate: birthdate,
                weight: row[weightIdx] ?? null,
                height: row[heightIdx] ?? null,
            };
        });

    console.log(`Parsed ${formatted.length} valid rows`, formatted);

    return formatted;
};