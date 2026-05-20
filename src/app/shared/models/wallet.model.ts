export interface Wallet {
  id: string;
  userId?: string;
  name: string;
  balance: number;
  type: 'bank' | 'cash';
  user?: { id: string };
  date?: string;
}
