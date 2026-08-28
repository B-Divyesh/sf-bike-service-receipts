export type Bike = {
  id: string;
  name: string;
  kind: string;
  year?: number;
  color?: string;
  odometerKm: number;
  createdAt: string;
  updatedAt: string;
};

export type Receipt = {
  id: string;
  bikeId: string;
  action: string;
  component: string;
  servicedAt: string;
  cost: number | null;
  currency: string;
  odometerKm: number | null;
  provider: string;
  notes: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
};

export type Reminder = {
  id: string;
  bikeId: string;
  component: string;
  label: string;
  intervalMonths: number | null;
  intervalKm: number | null;
  baselineDate: string;
  baselineKm: number | null;
  createdAt: string;
  updatedAt: string;
};

export type AppData = {
  version: 1;
  exportedAt: string;
  bikes: Bike[];
  receipts: Receipt[];
  reminders: Reminder[];
};

export type ViewName = 'log' | 'history' | 'schedule' | 'data';
