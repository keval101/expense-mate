import { SavingsType } from '../models/savings.model';

export const SAVINGS_TYPE_CONFIG: Record<SavingsType, { label: string; icon: string; color: string }> = {
  emergency: { label: 'Emergency Fund', icon: 'ri-shield-check-line', color: '#EF4444' },
  investment: { label: 'Investment', icon: 'ri-line-chart-line', color: '#3B82F6' },
  goal: { label: 'Goal', icon: 'ri-flag-line', color: '#10B981' },
};

export const SAVINGS_TYPES: SavingsType[] = ['emergency', 'investment', 'goal'];
