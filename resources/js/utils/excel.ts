import * as XLSX from 'xlsx';

export const readExcel = async (file: File) => {
    const data = await file.arrayBuffer();

    const workbook = XLSX.read(data, { type: 'array' });

    let sheet = null;
    let headerIndex = -1;

    for (const sheetName of workbook.SheetNames) {
        const tempSheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<any[]>(tempSheet, { header: 1 });

        const foundIndex = rows.findIndex((row) => row.includes && row.includes('Full Name of Child'));

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

    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
    const headers = rows[headerIndex];

    // Find exact column indices
    const fullNameIdx = 3; // 'Full Name of Child' is at column 3
    const sexIdx = 5; // 'Sex' is at column 5
    const birthdateIdx = 6; // Date of Birth (Excel serial) at column 6
    const weightIdx = 8; // Weight at column 8
    const heightIdx = 9; // Height at column 9

    // Skip header row + instruction row (row 8 has instructions like "(kg)")
    const dataRows = rows.slice(headerIndex + 2);

    const formatted = dataRows
        .filter((row) => {
            const fullName = row[fullNameIdx];
            if (!fullName || typeof fullName !== 'string') return false;
            // Skip instruction placeholders
            if (fullName.includes('Surname') || fullName.includes('(')) return false;
            return true;
        })
        .map((row) => ({
            fullName: row[fullNameIdx],
            sex: row[sexIdx],
            birthdate: row[birthdateIdx],
            weight: row[weightIdx],
            height: row[heightIdx],
        }));

    console.log(`Parsed ${formatted.length} valid rows`);

    return formatted;
};
