import { describe, expect, it } from 'vitest';
import { receiptsCsv, reminderStatus } from './domain';
import { createReceiptsPdf } from './pdf';
import type { Bike, Receipt, Reminder } from './types';

const bike: Bike = { id: 'bike-1', name: 'Fern', kind: 'City / hybrid', odometerKm: 1_250, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' };
const reminder: Reminder = { id: 'rem-1', bikeId: bike.id, component: 'Chain', label: 'Chain check', intervalMonths: 2, intervalKm: 300, baselineDate: '2026-06-01', baselineKm: 1_000, createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' };
const receipt: Receipt = { id: 'receipt-1', bikeId: bike.id, component: 'Chain', action: 'Lubricated', servicedAt: '2026-06-01', cost: 12.5, currency: 'INR', odometerKm: 1_000, provider: 'Me', notes: 'Cleaned, then used "dry" lube', createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' };

describe('reminderStatus', () => {
  it('marks a rule due when its odometer threshold is reached', () => {
    expect(reminderStatus(reminder, { ...bike, odometerKm: 1_300 }, new Date('2026-06-10T12:00:00Z')).kind).toBe('overdue');
  });

  it('describes both time and distance evidence', () => {
    const status = reminderStatus(reminder, bike, new Date('2026-06-10T12:00:00Z'));
    expect(status.detail).toContain('Aug');
    expect(status.detail).toContain('1,300 km');
  });
});

describe('portable exports', () => {
  it('quotes commas and quotes in CSV evidence', () => {
    const csv = receiptsCsv([receipt], [bike]);
    expect(csv).toContain('"Cleaned, then used ""dry"" lube"');
    expect(csv).toContain('Fern,Chain,Lubricated');
  });

  it('creates a real PDF blob containing receipt content', async () => {
    const blob = createReceiptsPdf([receipt], [bike]);
    expect(blob.type).toBe('application/pdf');
    expect((await blob.text()).slice(0, 8)).toBe('%PDF-1.4');
    expect(await blob.text()).toContain('Chain: Lubricated');
  });
});
