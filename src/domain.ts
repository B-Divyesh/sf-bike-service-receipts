import type { Bike, Receipt, Reminder } from './types';

export const COMPONENTS = ['Chain', 'Brakes', 'Tyres', 'Drivetrain', 'Wheels', 'Suspension', 'Bearings', 'Other'] as const;
export const ACTIONS = ['Cleaned', 'Lubricated', 'Inspected', 'Adjusted', 'Repaired', 'Replaced', 'Shop service'] as const;

export function uid(): string {
  return crypto.randomUUID();
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dateLabel(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export function moneyLabel(value: number | null, currency: string): string {
  if (value === null) return 'Cost not recorded';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function addMonths(dateValue: string, months: number): Date {
  const date = new Date(`${dateValue}T12:00:00`);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, end));
  return date;
}

export type ReminderStatus = {
  kind: 'overdue' | 'soon' | 'later';
  label: string;
  detail: string;
  dueDate?: Date;
  dueKm?: number;
};

export function reminderStatus(reminder: Reminder, bike: Bike, now = new Date()): ReminderStatus {
  const dueDate = reminder.intervalMonths ? addMonths(reminder.baselineDate, reminder.intervalMonths) : undefined;
  const dueKm = reminder.intervalKm && reminder.baselineKm !== null ? reminder.baselineKm + reminder.intervalKm : undefined;
  const days = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / 86_400_000) : undefined;
  const kmLeft = dueKm === undefined ? undefined : dueKm - bike.odometerKm;
  const overdue = (days !== undefined && days < 0) || (kmLeft !== undefined && kmLeft <= 0);
  const soon = (days !== undefined && days <= 14) || (kmLeft !== undefined && kmLeft <= Math.max(50, (reminder.intervalKm ?? 0) * 0.1));
  const parts: string[] = [];
  if (dueDate) parts.push(`by ${dateLabel(dueDate.toISOString().slice(0, 10))}`);
  if (dueKm !== undefined) parts.push(`at ${dueKm.toLocaleString()} km`);
  return {
    kind: overdue ? 'overdue' : soon ? 'soon' : 'later',
    label: overdue ? 'Due now' : soon ? 'Due soon' : 'Later',
    detail: parts.length ? parts.join(' or ') : 'No interval set',
    dueDate,
    dueKm,
  };
}

export function latestForComponent(receipts: Receipt[], bikeId: string, component: string): Receipt | undefined {
  return receipts
    .filter((item) => item.bikeId === bikeId && item.component === component)
    .sort((a, b) => b.servicedAt.localeCompare(a.servicedAt))[0];
}

function csvCell(value: string | number | null): string {
  const text = value === null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function receiptsCsv(receipts: Receipt[], bikes: Bike[]): string {
  const names = new Map(bikes.map((bike) => [bike.id, bike.name]));
  const rows = receipts
    .slice()
    .sort((a, b) => b.servicedAt.localeCompare(a.servicedAt))
    .map((r) => [r.servicedAt, names.get(r.bikeId) ?? 'Unknown bike', r.component, r.action, r.provider, r.cost, r.currency, r.odometerKm, r.notes].map(csvCell).join(','));
  return ['Date,Bike,Component,Action,Provider,Cost,Currency,Odometer (km),Notes', ...rows].join('\r\n');
}

export function safeFilename(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'bike';
}
