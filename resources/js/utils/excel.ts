import * as XLSX from "xlsx";

export const readExcel = async (file: File) => {
    const data = await file.arrayBuffer();

    const workbook = XLSX.read(data, { type: "array" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // 👇 Convert to array (raw rows)
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, {
        header: 1 // returns array of arrays
    });

    // 🔍 Find the row that contains your REAL headers
    const headerIndex = rows.findIndex((row) =>
        row.includes("Full Name of Child")
    );

    if (headerIndex === -1) {
        console.error("Header row not found!");
        return [];
    }

    // 🧠 Extract headers
    const headers = rows[headerIndex];

    // 📦 Extract data below headers
    const dataRows = rows.slice(headerIndex + 1);

    // 🔄 Convert to objects
    const formatted = dataRows.map((row) => {
        const obj: any = {};

        headers.forEach((header: string, index: number) => {
            obj[header] = row[index];
        });

        return obj;
    });

    return formatted;
};