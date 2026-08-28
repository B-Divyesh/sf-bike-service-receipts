import { describe, expect, it } from 'vitest';
import { validateImport } from './db';

describe('validateImport', () => {
  it('accepts a complete version 1 backup', () => {
    const data = {
      version: 1,
      exportedAt: '2026-01-01T00:00:00Z',
      bikes: [{ id: 'b', name: 'Bike', kind: 'Road', odometerKm: 10, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }],
      receipts: [{ id: 'r', bikeId: 'b', action: 'Cleaned', component: 'Chain', servicedAt: '2026-01-01', cost: 0, currency: 'INR', odometerKm: 10, provider: '', notes: '', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }],
      reminders: [],
    };
    expect(validateImport(data).bikes).toHaveLength(1);
  });

  it('rejects the formerly accepted incomplete bike record', () => {
    const data = { version: 1, exportedAt: 'x', bikes: [{ id: 'poison', name: 'Poison' }], receipts: [], reminders: [] };
    expect(() => validateImport(data)).toThrow(/bike record is incomplete/i);
  });

  it('rejects wrong primitive types and optional field types', () => {
    const data = { version: 1, exportedAt: 'x', bikes: [{ id: 'b', name: 'Bike', kind: 'Road', odometerKm: '10', color: 4, createdAt: 'x', updatedAt: 'x' }], receipts: [], reminders: [] };
    expect(() => validateImport(data)).toThrow(/invalid value/i);
  });

  it('rejects orphaned records before writing anything', () => {
    const data = { version: 1, exportedAt: '2026-01-01T00:00:00Z', bikes: [], receipts: [{ id: 'r', bikeId: 'missing' }], reminders: [] };
    expect(() => validateImport(data)).toThrow(/missing bike/i);
  });
});
