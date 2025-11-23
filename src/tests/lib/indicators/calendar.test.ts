import { describe, expect, it } from 'vitest';
import { dayOfMonth, dayOfWeek, dayOfYear, month } from '@/lib/indicators';

describe('Calendar Indicators', () => {
  const date = '2024-12-31';

  it('returns the UTC month with optional delay', () => {
    const [value, realDate] = month(date);
    expect(value).toBe(12);
    expect(realDate).toBe('2024-12-31');

    const [value2, realDate2] = month(date, 31);
    expect(value2).toBe(11);
    expect(realDate2).toBe('2024-11-30');
  });

  it('returns the UTC day of week with optional delay', () => {
    expect(dayOfWeek(date)).toEqual([2, '2024-12-31']);
    expect(dayOfWeek(date, 1)).toEqual([1, '2024-12-30']);
  });

  it('returns the UTC day of month with optional delay', () => {
    expect(dayOfMonth(date)).toEqual([31, '2024-12-31']);
    expect(dayOfMonth(date, 1)).toEqual([30, '2024-12-30']);
  });

  it('returns the UTC day of year respecting delay', () => {
    expect(dayOfYear(date)).toEqual([366, '2024-12-31']);
    expect(dayOfYear(date, 30)).toEqual([336, '2024-12-01']);
  });
});
