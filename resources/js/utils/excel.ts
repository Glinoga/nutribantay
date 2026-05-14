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

export const readExcel = async (file: File) => {
    const data = await file.arrayBuffer();

    const workbook = XLSX.read(data, { type: 'array' });

    let sheet = null;
    let headerIndex = -1;

    for (const sheetName of workbook.SheetNames) {
        const tempSheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(tempSheet, { header: 1 }) as (string | number | null)[][];

        const foundIndex = rows.findIndex((row) => Array.isArray(row) && row.some((cell) => cell === 'Full Name of Child'));

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

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number | null)[][];

    const addressIdx = 1;
    const fullNameIdx = 3;
    const sexIdx = 5;
    const birthdateIdx = 6;
    const weightIdx = 8;
    const heightIdx = 9;

    const dataRows = rows.slice(headerIndex + 2);

    const formatted = dataRows
        .filter((row) => {
            const fullName = row[fullNameIdx];
            if (typeof fullName !== 'string') return false;
            if (fullName.includes('Surname') || fullName.includes('(')) return false;
            return true;
        })
        .map((row) => {
            const fullName = row[fullNameIdx]?.toString().trim() || '';

            const commaIndex = fullName.indexOf(', ');
            let lastName: string, firstName: string, middleInitial: string | null;
            if (commaIndex !== -1) {
                lastName = fullName.substring(0, commaIndex).trim();
                const givenPart = fullName.substring(commaIndex + 2).trim();
                const givenParts = givenPart.split(' ');
                firstName = givenParts[0] || '';
                middleInitial = givenParts.slice(1).join(' ') || null;
            } else {
                const nameParts = fullName.split(' ');
                lastName = nameParts[0] || '';
                firstName = nameParts.slice(1).join(' ') || '';
                middleInitial = null;
            }

            const sex = row[sexIdx]?.toString().trim() || '';
            const sexNormalized = sex.toUpperCase().startsWith('M') ? 'M' : 'F';
            const birthdateRaw = row[birthdateIdx];
            const birthdate = typeof birthdateRaw === 'number' ? excelDateToJSDate(birthdateRaw) : birthdateRaw;

            return {
                fullName: fullName,
                first_name: firstName,
                middle_initial: middleInitial,
                last_name: lastName,
                sex: sexNormalized,
                birthdate: birthdate,
                weight: row[weightIdx] || null,
                height: row[heightIdx] || null,
                address: row[addressIdx]?.toString().trim() || null,
            };
        });

    console.log(`Parsed ${formatted.length} valid rows`, formatted);

    return formatted;
};
