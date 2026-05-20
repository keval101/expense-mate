export type SavingsType = 'emergency' | 'investment' | 'goal';

export interface Savings {
  id: string;
  userId: string;
  title: string;
  amount: number;
  walletId: string;
  walletName?: string;
  date: string;
  dateTs: number;
  monthKey: string;
  note?: string;
  type: SavingsType;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CreateSavingsDto {
  title: string;
  amount: number;
  walletId: string;
  date: Date;
  note?: string;
  type: SavingsType;
}

export interface UpdateSavingsDto {
  title?: string;
  amount?: number;
  walletId?: string;
  date?: Date;
  note?: string;
  type?: SavingsType;
}

export interface SavingsFilter {
  monthKeys?: string[];
  types?: SavingsType[];
}
