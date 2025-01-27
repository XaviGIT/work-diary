import { jsPDF } from "jspdf";
import { formatDate } from "./dates";
import { stripMarkdown } from "./markdown";

export const exportToPDF = (date, entries) => {
  const doc = new jsPDF();
  let yPos = 20;

  // Add title
  doc.setFontSize(16);
  doc.text(formatDate(date), 20, yPos);

  entries.forEach((entry) => {
    yPos += 10;

    // Add time
    doc.setFontSize(12);
    doc.text(entry.entry_time.substring(0, 5), 20, yPos);

    // Add description with stripped markdown
    const cleanText = stripMarkdown(entry.description);
    const lines = doc.splitTextToSize(cleanText, 170);
    lines.forEach((line) => {
      yPos += 7;
      if (yPos >= 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 30, yPos);
    });

    yPos += 5; // Space between entries
  });

  doc.save(`diary-${date}.pdf`);
};
