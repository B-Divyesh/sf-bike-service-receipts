import type { AppData, Bike, Receipt, Reminder } from './types';

const DEMO_DATABASE = 'demo:bike-service-receipts';
const DB_NAME = typeof location !== 'undefined'
  && (location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1')
  ? DEMO_DATABASE
  : 'bike-service-receipts';
const DB_VERSION = 1;
const STORES = ['bikes', 'receipts', 'reminders'] as const;
type StoreName = (typeof STORES)[number];

let database: Promise<IDBDatabase> | undefined;

function openDatabase(): Promise<IDBDatabase> {
  if (database) return database;
  database = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const name of STORES) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open the service log.'));
    request.onblocked = () => reject(new Error('Close other tabs, then try opening the service log again.'));
  });
  return database;
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('A local storage operation failed.'));
  });
}

export async function getAll<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, 'readonly');
  return requestResult(transaction.objectStore(storeName).getAll()) as Promise<T[]>;
}

export async function put<T extends { id: string }>(storeName: StoreName, value: T): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, 'readwrite');
  await requestResult(transaction.objectStore(storeName).put(value));
}

export async function remove(storeName: StoreName, id: string): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, 'readwrite');
  await requestResult(transaction.objectStore(storeName).delete(id));
}

export async function removeBikeAndRecords(id: string): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction(STORES, 'readwrite');
  transaction.objectStore('bikes').delete(id);
  const [receipts, reminders] = await Promise.all([
    requestResult(transaction.objectStore('receipts').getAll()) as Promise<Receipt[]>,
    requestResult(transaction.objectStore('reminders').getAll()) as Promise<Reminder[]>,
  ]);
  for (const receipt of receipts) if (receipt.bikeId === id) transaction.objectStore('receipts').delete(receipt.id);
  for (const reminder of reminders) if (reminder.bikeId === id) transaction.objectStore('reminders').delete(reminder.id);
  await transactionDone(transaction);
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Could not save local changes.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Local changes were cancelled.'));
  });
}

export async function readAllData(): Promise<AppData> {
  const [bikes, receipts, reminders] = await Promise.all([
    getAll<Bike>('bikes'), getAll<Receipt>('receipts'), getAll<Reminder>('reminders'),
  ]);
  return { version: 1, exportedAt: new Date().toISOString(), bikes, receipts, reminders };
}

export async function importAllData(data: AppData, mode: 'merge' | 'replace'): Promise<void> {
  // Keep validation outside the write transaction. A rejected file must never
  // partially mutate the user's existing log.
  const validated = validateImport(data);
  const db = await openDatabase();
  const transaction = db.transaction(STORES, 'readwrite');
  if (mode === 'replace') for (const name of STORES) transaction.objectStore(name).clear();
  for (const bike of validated.bikes) transaction.objectStore('bikes').put(bike);
  for (const receipt of validated.receipts) transaction.objectStore('receipts').put(receipt);
  for (const reminder of validated.reminders) transaction.objectStore('reminders').put(reminder);
  await transactionDone(transaction);
}

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const isText = (value: unknown): value is string => typeof value === 'string' && value.length > 0;
const isOptionalText = (value: unknown): value is string | undefined => value === undefined || typeof value === 'string';
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const isOptionalNumber = (value: unknown): value is number | undefined => value === undefined || isNumber(value);
const isNullableNumber = (value: unknown): value is number | null => value === null || isNumber(value);

function isBike(value: unknown): value is Bike {
  if (!isRecord(value)) return false;
  return isText(value.id) && isText(value.name) && isText(value.kind)
    && isNumber(value.odometerKm) && isText(value.createdAt) && isText(value.updatedAt)
    && isOptionalNumber(value.year) && isOptionalText(value.color);
}

function isReceipt(value: unknown, bikeIds: Set<string>): value is Receipt {
  if (!isRecord(value)) return false;
  return isText(value.id) && isText(value.bikeId) && bikeIds.has(value.bikeId)
    && isText(value.action) && isText(value.component) && isText(value.servicedAt)
    && isNullableNumber(value.cost) && isText(value.currency) && isNullableNumber(value.odometerKm)
    && typeof value.provider === 'string' && typeof value.notes === 'string'
    && isOptionalText(value.photo) && isText(value.createdAt) && isText(value.updatedAt);
}

function isReminder(value: unknown, bikeIds: Set<string>): value is Reminder {
  if (!isRecord(value)) return false;
  return isText(value.id) && isText(value.bikeId) && bikeIds.has(value.bikeId)
    && isText(value.component) && isText(value.label)
    && isNullableNumber(value.intervalMonths) && isNullableNumber(value.intervalKm)
    && isText(value.baselineDate) && isNullableNumber(value.baselineKm)
    && isText(value.createdAt) && isText(value.updatedAt);
}

export function validateImport(input: unknown): AppData {
  if (!input || typeof input !== 'object') throw new Error('This file does not contain a service log.');
  const data = input as Partial<AppData>;
  if (data.version !== 1 || !isText(data.exportedAt) || !Array.isArray(data.bikes) || !Array.isArray(data.receipts) || !Array.isArray(data.reminders)) {
    throw new Error('Choose a Bike Service Receipts JSON backup (version 1).');
  }
  if (!data.bikes.every(isBike)) {
    throw new Error('A bike record is incomplete or has an invalid value. Nothing was imported.');
  }
  const validIds = new Set(data.bikes.map((bike) => bike.id));
  if (!data.receipts.every((receipt) => isReceipt(receipt, validIds)) || !data.reminders.every((reminder) => isReminder(reminder, validIds))) {
    throw new Error('A service or reminder is incomplete, invalid, or belongs to a missing bike. Nothing was imported.');
  }
  return data as AppData;
}

export type RecoveryResult = { data: AppData; removed: number };

export async function inspectStoredData(): Promise<RecoveryResult> {
  const raw = await readAllData();
  const bikes = raw.bikes.filter(isBike);
  const bikeIds = new Set(bikes.map((bike) => bike.id));
  const receipts = raw.receipts.filter((receipt) => isReceipt(receipt, bikeIds));
  const reminders = raw.reminders.filter((reminder) => isReminder(reminder, bikeIds));
  return {
    data: { version: 1, exportedAt: raw.exportedAt, bikes, receipts, reminders },
    removed: raw.bikes.length + raw.receipts.length + raw.reminders.length - bikes.length - receipts.length - reminders.length,
  };
}

export async function repairStoredData(): Promise<RecoveryResult> {
  const result = await inspectStoredData();
  await importAllData(result.data, 'replace');
  return result;
}
