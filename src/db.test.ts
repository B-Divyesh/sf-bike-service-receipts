import { describe, expect, it } from 'vitest';
import { validateImport } from './db';

describe('validateImport', () => {
  it('accepts a complete version 1 backup', () => {
    const data = { version: 1, exportedAt: '2026-01-01T00:00:00Z', bikes: [{ id: 'b', name: 'Bike' }], receipts: [{ id: 'r', bikeId: 'b' }], reminders: [] };
    expect(validateImport(data).bikes).toHaveLength(1);
  });

  it('rejects orphaned records before writing anything', () => {
    const data = { version: 1, exportedAt: '2026-01-01T00:00:00Z', bikes: [], receipts: [{ id: 'r', bikeId: 'missing' }], reminders: [] };
    expect(() => validateImport(data)).toThrow(/missing bikes/i);
  });
});
