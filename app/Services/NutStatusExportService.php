<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class NutStatusExportService
{
    private Spreadsheet $spreadsheet;

    private Worksheet $sheet;

    public function generate(Collection $children, array $meta): Spreadsheet
    {
        $this->spreadsheet = new Spreadsheet;
        $this->sheet = $this->spreadsheet->getActiveSheet();
        $this->sheet->setTitle('Nut_StatusTool');

        $this->setColumnWidths();
        $this->buildHeaderSection($meta);
        $this->buildDataRows($children);

        return $this->spreadsheet;
    }

    private function setColumnWidths(): void
    {
        $widths = [
            'A' => 10.73,
            'B' => 26.73,
            'C' => 28.73,
            'D' => 32.73,
            'E' => 11.45,
            'F' => 9.73,
            'G' => 16.27,
            'H' => 12,
            'I' => 10.73,
            'J' => 10.73,
            'K' => 12.82,
            'L' => 13.73,
            'M' => 12.82,
            'N' => 12,
        ];

        foreach ($widths as $col => $width) {
            $this->sheet->getColumnDimension($col)->setWidth($width);
        }
    }

    private function buildHeaderSection(array $meta): void
    {
        // Row heights
        $rowHeights = [1 => 36, 2 => 20.25, 3 => 28, 4 => 17.15, 5 => 17.15, 6 => 52, 7 => 30, 8 => 30, 9 => 28];
        foreach ($rowHeights as $row => $height) {
            $this->sheet->getRowDimension($row)->setRowHeight($height);
        }

        $defaultFont = ['name' => 'Calibri', 'size' => 12];
        $this->sheet->getStyle('A1:N1009')->applyFromArray(['font' => $defaultFont]);
        $this->sheet->getStyle('A1:N1009')->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

        // ── Row 1: Title Bar ──
        $this->sheet->setCellValue('A1', 'Version: Mar 2021');
        $this->sheet->getStyle('A1')->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => 10, 'color' => ['rgb' => 'FFFFFF']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        $this->sheet->mergeCells('B1:C1');
        $this->sheet->setCellValue('B1', 'TO START, PRESS CTRL+F1 OR CTRL+Fn+F1');
        $this->sheet->getStyle('B1')->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => 15, 'bold' => true, 'color' => ['rgb' => 'FF0000']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        $this->sheet->mergeCells('D1:G1');
        $this->sheet->setCellValue('D1', 'Community Level e-OPT PLUS Tool');
        $this->sheet->getStyle('D1')->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => 20, 'bold' => true],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
        ]);

        $this->sheet->mergeCells('H1:I1');
        $this->sheet->setCellValue('H1', 'PLS READ THIS FIRST');
        $this->sheet->getStyle('H1')->getFont()->setName('Calibri')->setSize(10)->getColor()->setRGB('4472C4');
        $this->sheet->getStyle('H1')->getFont()->setUnderline(true);

        $this->sheet->setCellValue('J1', 'Date:');
        $this->sheet->getStyle('J1')->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => 12],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
        ]);

        $this->sheet->setCellValue('K1', Carbon::now()->format('Y-m-d'));
        $this->sheet->getStyle('K1')->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => 12],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        $this->sheet->setCellValue('L1', 'Year:');
        $this->sheet->getStyle('L1')->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => 14, 'bold' => true],
        ]);

        $this->sheet->setCellValue('M1', Carbon::now()->format('Y'));
        $this->sheet->getStyle('M1')->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => 14, 'bold' => true],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        // ── Row 2: Description ──
        $this->sheet->setCellValue('A2', 'THIS TOOL IS FOR:');
        $this->sheet->getStyle('A2')->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => 12, 'bold' => true],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
        ]);

        $this->sheet->mergeCells('C2:K2');
        $descText = 'This tool is designed for the preparation and encoding of data in the Community Level e-OPT Plus Tool.';
        $this->sheet->setCellValue('C2', $descText);
        $this->sheet->getStyle('C2')->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => 11, 'color' => ['rgb' => '336600']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT, 'wrapText' => true],
        ]);

        $this->sheet->setCellValue('M2', 'Begin here');
        $this->sheet->getStyle('M2')->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => 12, 'color' => ['rgb' => 'FF0000']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_TOP],
        ]);

        // ── Row 3: Barangay & Title ──
        $this->sheet->mergeCells('A3:B3');
        $this->sheet->setCellValue('A3', $meta['barangay'] ?? '');
        $this->sheet->getStyle('A3')->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => 14],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '00B050']],
        ]);

        $this->sheet->mergeCells('D3:J3');
        $this->sheet->setCellValue('D3', 'WEIGHT FOR AGE, HEIGHT FOR AGE, & WEIGHT FOR LENGTH/HEIGHT STATUS');
        $this->sheet->getStyle('D3')->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => 16, 'bold' => true, 'color' => ['rgb' => '003300']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'wrapText' => true],
        ]);

        // ── Row 4: Instruction ──
        $this->sheet->mergeCells('A4:N4');
        $this->sheet->setCellValue('A4', 'Select from dropdown list using the arrow button on the right side of the cell.');
        $this->sheet->getStyle('A4')->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => 11],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'wrapText' => true],
        ]);

        // ── Row 5: Zoom tip ──
        $this->sheet->mergeCells('A5:N5');
        $this->sheet->setCellValue('A5', 'ADJUST YOUR ZOOM SETTINGS TO 70% FOR BETTER VIEW');
        $this->sheet->getStyle('A5')->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFFF00']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_TOP, 'wrapText' => true],
        ]);

        // ── Row 6: Location Labels ──
        $this->sheet->mergeCells('A6:B6');
        $this->sheet->setCellValue('A6', 'Purok/Area/Block:');
        $this->sheet->getStyle('A6')->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => 14, 'bold' => true],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
        ]);

        $this->sheet->setCellValue('C6', 'PHASE 1 (JAN)');
        $this->sheet->getStyle('C6')->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => 14, 'bold' => true],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
        ]);

        $this->sheet->setCellValue('D6', 'Barangay:');
        $this->sheet->getStyle('D6')->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => 14, 'bold' => true],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
        ]);

        $this->sheet->mergeCells('E6:G6');
        $this->sheet->setCellValue('E6', strtoupper($meta['barangay'] ?? ''));
        $this->sheet->getStyle('E6')->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => 14, 'bold' => true],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
        ]);

        $this->sheet->mergeCells('L6:M6');
        $this->sheet->setCellValue('L6', 'Province/City:');
        $this->sheet->getStyle('L6')->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => 14, 'bold' => true],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
        ]);

        $this->sheet->setCellValue('N6', $meta['city'] ?? '');
        $this->sheet->getStyle('N6')->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => 16, 'bold' => true],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
        ]);

        // ── Rows 7–9: Column Headers ──
        $this->buildColumnHeaders();
    }

    private function buildColumnHeaders(): void
    {
        // Row 7
        $this->sheet->mergeCells('A7:A9');
        $this->setHeaderCell('A7', 'Child Seq.', true, 12);

        $this->sheet->mergeCells('B7:B8');
        $this->setHeaderCell('B7', 'Address or Location', true, 11);
        $this->sheet->setCellValue('B9', 'Purok, Block #, Area or Location in the Barangay');
        $this->setHeaderCell('B9', 'Purok, Block #, Area or Location in the Barangay', false, 10);

        $this->sheet->mergeCells('C7:C8');
        $this->setHeaderCell('C7', 'Name of Mother', true, 11);
        $this->sheet->setCellValue('C9', '(Surname, First Name)');
        $this->setHeaderCell('C9', '(Surname, First Name)', false, 10);

        $this->sheet->mergeCells('D7:D8');
        $this->setHeaderCell('D7', 'Full Name of Child', true, 11);
        $this->sheet->setCellValue('D9', '(Surname, First Name)');
        $this->setHeaderCell('D9', '(Surname, First Name)', false, 10);

        $this->sheet->mergeCells('E7:E8');
        $this->setHeaderCell('E7', 'Belongs to IP Group?', true, 11);
        $this->sheet->setCellValue('E9', 'YES/NO');
        $this->setHeaderCell('E9', 'YES/NO', false, 10);

        $this->sheet->mergeCells('F7:F8');
        $this->setHeaderCell('F7', 'Sex', true, 11);
        $this->sheet->setCellValue('F9', 'M/F');
        $this->setHeaderCell('F9', 'M/F', false, 10);

        // G7: yellow background warning
        $this->sheet->mergeCells('G8:G9');
        $this->sheet->setCellValue('G7', '');
        $this->sheet->getStyle('G7')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('FFFF00');
        $this->sheet->setCellValue('G8', 'Date of Birth');
        $this->setHeaderCell('G8', 'Date of Birth', true, 11);
        $this->sheet->getStyle('G8')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $this->sheet->mergeCells('H8:H9');
        $this->sheet->setCellValue('H8', 'Date Measured');
        $this->setHeaderCell('H8', 'Date Measured', true, 11);

        $this->sheet->mergeCells('I7:I8');
        $this->setHeaderCell('I7', 'Weight', true, 11);
        $this->sheet->setCellValue('I9', '(kg)');
        $this->setHeaderCell('I9', '(kg)', false, 10);

        $this->sheet->mergeCells('J7:J8');
        $this->setHeaderCell('J7', 'Height', true, 11);
        $this->sheet->setCellValue('J9', '(cm)');
        $this->setHeaderCell('J9', '(cm)', false, 10);

        // K7: auto-fill notice
        $this->sheet->setCellValue('K7', 'NO DATA ENTRY REQUIRED — RESULTS WILL BE AUTO-FILLED');
        $this->sheet->getStyle('K7')->getFont()->setName('Calibri')->setSize(11)->setBold(true)->getColor()->setRGB('003300');
        $this->sheet->getStyle('K7')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setWrapText(true);

        $this->sheet->mergeCells('K8:K9');
        $this->sheet->setCellValue('K8', 'Age in Months');
        $this->setHeaderCell('K8', 'Age in Months', true, 11);

        $this->sheet->mergeCells('L8:L9');
        $this->sheet->setCellValue('L8', 'Weight for Age Status');
        $this->setHeaderCell('L8', 'Weight for Age Status', true, 11);

        $this->sheet->mergeCells('M8:M9');
        $this->sheet->setCellValue('M8', 'Height for Age Status');
        $this->setHeaderCell('M8', 'Height for Age Status', true, 11);

        $this->sheet->mergeCells('N8:N9');
        $this->sheet->setCellValue('N8', 'Weight for Lt/Ht Status');
        $this->setHeaderCell('N8', 'Weight for Lt/Ht Status', true, 11);
    }

    private function setHeaderCell(string $cell, string $value, bool $bold, int $size): void
    {
        $this->sheet->setCellValue($cell, $value);
        $this->sheet->getStyle($cell)->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => $size, 'bold' => $bold],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
        ]);
    }

    private function buildDataRows(Collection $children): void
    {
        $row = 10;
        $seq = 0;

        foreach ($children as $child) {
            $seq++;
            $hl = $child->latestHealthlog;
            $dateMeasured = $hl?->created_at?->format('Y-m-d');
            $dob = $child->birthdate?->format('Y-m-d');

            // Data cells
            $this->setDataCell("A{$row}", $seq, 'center');
            $this->setDataCell("B{$row}", $child->address ?? '', 'left', true);
            $this->setDataCell("C{$row}", $this->formatName($child->mother_name ?? ''), 'left', true);
            $this->setDataCell("D{$row}", $child->formatted_name, 'left', true);
            $this->setDataCell("E{$row}", $child->belongs_to_ip ? 'YES' : 'NO', 'center');
            $this->setDataCell("F{$row}", $child->sex === 'Male' ? 'M' : 'F', 'center');
            $this->setDataCell("G{$row}", $dob, 'center');
            $this->setDataCell("H{$row}", $dateMeasured, 'center');
            $this->setDataCell("I{$row}", $child->weight !== null ? number_format((float) $child->weight, 1) : '', 'center');
            $this->setDataCell("J{$row}", $child->height !== null ? number_format((float) $child->height, 1) : '', 'center');
            $this->setDataCell("K{$row}", $child->age ?? '', 'center');

            // Status columns with color coding
            $wfaShort = $this->toShortStatus($hl?->status_wfa, 'wfa');
            $lfaShort = $this->toShortStatus($hl?->status_lfa, 'lfa');
            $wflShort = $this->toShortStatus($hl?->status_wfl_wfh, 'wfl');

            $this->setStatusCell("L{$row}", $wfaShort);
            $this->setStatusCell("M{$row}", $lfaShort);
            $this->setStatusCell("N{$row}", $wflShort);

            $this->sheet->getRowDimension($row)->setRowHeight(34);
            $row++;
        }

        // Freeze pane at row 10 (data start)
        $this->sheet->freezePane('A10');
    }

    private function setDataCell(string $cell, mixed $value, string $align = 'center', bool $wrap = false): void
    {
        $this->sheet->setCellValue($cell, $value);
        $this->sheet->getStyle($cell)->applyFromArray([
            'font' => ['name' => 'Calibri', 'size' => 12],
            'alignment' => [
                'horizontal' => $align === 'left' ? Alignment::HORIZONTAL_LEFT : Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
                'wrapText' => $wrap,
            ],
        ]);
    }

    private function setStatusCell(string $cell, string $value): void
    {
        $this->sheet->setCellValue($cell, $value ?: 'N/A');
        $style = $this->sheet->getStyle($cell);

        $style->getFont()->setName('Calibri')->setSize(12)->setBold(true);
        $style->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);

        $color = $this->getStatusColor($value);
        if ($color !== null) {
            $style->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB($color);
        }
    }

    private function getStatusColor(string $shortCode): ?string
    {
        return match ($shortCode) {
            'N', 'T' => '00FF00',
            'UW', 'St', 'MW' => 'FFFF00',
            'SUW', 'SSt', 'SW' => 'FF0000',
            'OW', 'Ob' => 'FFC000',
            default => null,
        };
    }

    private function toShortStatus(?string $fullStatus, string $type): string
    {
        if ($fullStatus === null || $fullStatus === '' || $fullStatus === '-') {
            return '';
        }

        return match ($fullStatus) {
            'Normal' => 'N',
            'Underweight' => 'UW',
            'Severely Underweight' => 'SUW',
            'Overweight' => 'OW',
            'Obese' => 'Ob',
            'Stunted' => 'St',
            'Severely Stunted' => 'SSt',
            'Tall' => 'T',
            'Wasted' => 'MW',
            'Severely Wasted' => 'SW',
            default => $fullStatus,
        };
    }

    private function formatName(string $name): string
    {
        if (empty(trim($name))) {
            return '';
        }
        $parts = explode(' ', trim($name));
        if (count($parts) >= 2) {
            $last = array_pop($parts);
            $first = implode(' ', $parts);

            return "{$last}, {$first}";
        }

        return $name;
    }
}
