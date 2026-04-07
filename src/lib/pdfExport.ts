/**
 * PDF timetable export using jsPDF + jspdf-autotable.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PdfGridCell {
  courseName: string;
  isLab?: boolean;
}

export interface PdfTimeSlot {
  label: string;
  slotOrder: number;
  isBreak: boolean;
}

interface PdfExportOptions {
  title: string;
  subtitle?: string;
  grid: Record<string, PdfGridCell>; // key: `${day}-${slotOrder}`
  timeSlots: PdfTimeSlot[];
  days: string[];
  fileName?: string;
}

export function exportTimetablePdf({
  title,
  subtitle,
  grid,
  timeSlots,
  days,
  fileName = 'timetable.pdf',
}: PdfExportOptions) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 18);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(subtitle, 14, 25);
    doc.setTextColor(0);
  }

  const nonBreakSlots = timeSlots.filter((s) => !s.isBreak).sort((a, b) => a.slotOrder - b.slotOrder);

  const head = [['Day', ...nonBreakSlots.map((s) => s.label)]];

  const body = days.map((day) => {
    const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
    const cells = nonBreakSlots.map((slot) => {
      const cell = grid[`${day}-${slot.slotOrder}`];
      if (!cell) return '';
      return cell.isLab ? `🔬 ${cell.courseName}` : cell.courseName;
    });
    return [dayLabel, ...cells];
  });

  autoTable(doc, {
    head,
    body,
    startY: subtitle ? 30 : 24,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      halign: 'center',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [41, 98, 255],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'left' },
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, pageHeight - 8);

  doc.save(fileName);
}
