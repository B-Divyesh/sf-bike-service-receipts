import type { AppData, Bike, Receipt, Reminder } from './types';

const DB_NAME = 'bike-service-receipts';
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
    request.onerror = () => reject(request.error ?? new Error('Could not open the field log.'));
    request.onblocked = () => reject(new Error('Close other tabs, then try opening the field log again.'));
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
  const db = await openDatabase();
  const transaction = db.transaction(STORES, 'readwrite');
  if (mode === 'replace') for (const name of STORES) transaction.objectStore(name).clear();
  for (const bike of data.bikes) transaction.objectStore('bikes').put(bike);
  for (const receipt of data.receipts) transaction.objectStore('receipts').put(receipt);
  for (const reminder of data.reminders) transaction.objectStore('reminders').put(reminder);
  await transactionDone(transaction);
}

export function validateImport(input: unknown): AppData {
  if (!input || typeof input !== 'object') throw new Error('This file does not contain a field log.');
  const data = input as Partial<AppData>;
  if (data.version !== 1 || !Array.isArray(data.bikes) || !Array.isArray(data.receipts) || !Array.isArray(data.reminders)) {
    throw new Error('Choose a Bike Service Receipts JSON backup (version 1).');
  }
  const validIds = new Set(data.bikes.map((bike) => bike?.id));
  if (data.bikes.some((bike) => !bike?.id || !bike.name) || data.receipts.some((receipt) => !receipt?.id || !validIds.has(receipt.bikeId)) || data.reminders.some((reminder) => !reminder?.id || !validIds.has(reminder.bikeId))) {
    throw new Error('The backup is incomplete or has records for missing bikes. Nothing was imported.');
  }
  return data as AppData;
}
