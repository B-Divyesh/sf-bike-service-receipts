import type { Bike, Receipt } from './types';
import { dateLabel, moneyLabel } from './domain';

function ascii(value: string): string {
  return value.normalize('NFKD').replace(/[^\x20-\x7E]/g, '?');
}

function pdfText(value: string): string {
  return ascii(value).replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
}

function wrap(value: string, width = 78): string[] {
  const words = ascii(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if (`${line} ${word}`.trim().length > width && line) {
      lines.push(line);
      line = word;
    } else line = `${line} ${word}`.trim();
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

export function createReceiptsPdf(receipts: Receipt[], bikes: Bike[]): Blob {
  const bikeNames = new Map(bikes.map((bike) => [bike.id, bike.name]));
  const contentLines: Array<{ text: string; bold?: boolean; gap?: number }> = [
    { text: 'BIKE SERVICE RECEIPTS', bold: true, gap: 8 },
    { text: `Portable field log  |  Exported ${dateLabel(new Date().toISOString().slice(0, 10))}`, gap: 18 },
  ];
  for (const receipt of receipts.slice().sort((a, b) => b.servicedAt.localeCompare(a.servicedAt))) {
    contentLines.push(
      { text: `${dateLabel(receipt.servicedAt)}  |  ${bikeNames.get(receipt.bikeId) ?? 'Unknown bike'}`, bold: true, gap: 4 },
      { text: `${receipt.component}: ${receipt.action}` },
      { text: `${moneyLabel(receipt.cost, receipt.currency)}  |  ${receipt.odometerKm === null ? 'Odometer not recorded' : `${receipt.odometerKm.toLocaleString()} km`}` },
    );
    if (receipt.provider) contentLines.push({ text: `By: ${receipt.provider}` });
    if (receipt.notes) for (const line of wrap(`Notes: ${receipt.notes}`)) contentLines.push({ text: line });
    contentLines.push({ text: '--------------------------------------------------------------------------', gap: 10 });
  }
  if (!receipts.length) contentLines.push({ text: 'No service receipts have been logged yet.' });

  const pages: string[][] = [[]];
  let y = 760;
  for (const line of contentLines) {
    const gap = line.gap ?? 2;
    if (y < 72) { pages.push([]); y = 760; }
    pages.at(-1)!.push(`BT /F1 ${line.bold ? 12 : 10} Tf 54 ${y} Td (${pdfText(line.text)}) Tj ET`);
    y -= (line.bold ? 17 : 14) + gap;
  }

  const objects = new Map<number, string>();
  const pageIds = pages.map((_, index) => 4 + index * 2);
  objects.set(1, '<< /Type /Catalog /Pages 2 0 R >>');
  objects.set(2, `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`);
  objects.set(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  pages.forEach((lines, index) => {
    const pageId = pageIds[index]!;
    const contentId = pageId + 1;
    const stream = lines.join('\n');
    objects.set(pageId, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`);
    objects.set(contentId, `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  const maxId = Math.max(...objects.keys());
  for (let id = 1; id <= maxId; id += 1) {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects.get(id) ?? '<<>>'}\nendobj\n`;
  }
  const xref = pdf.length;
  pdf += `xref\n0 ${maxId + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= maxId; id += 1) pdf += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${maxId + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}
