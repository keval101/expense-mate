export type DateRangePreset = 'this_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'custom';

export const DATE_RANGE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'this_month', label: 'This month' },
  { value: 'last_3_months', label: 'Last 3 months' },
  { value: 'last_6_months', label: 'Last 6 months' },
  { value: 'this_year', label: 'This year' },
  { value: 'custom', label: 'Custom' },
];
