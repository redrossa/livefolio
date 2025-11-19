import { beforeEach, describe, expect, it, vi } from 'vitest';

const { delayDateMock, toUTCMarketCloseMock, toUTCMarketOpenMock } = vi.hoisted(
  () => ({
    delayDateMock: vi.fn<(date: string, d: number) => string>(),
    toUTCMarketCloseMock: vi.fn<(date: string) => Date>(),
    toUTCMarketOpenMock: vi.fn<(date: string) => Date>(),
  }),
);

vi.mock('@/lib/market/dates', () => ({
  delayDate: delayDateMock,
  toUTCMarketClose: toUTCMarketCloseMock,
  toUTCMarketOpen: toUTCMarketOpenMock,
}));

import { dayOfMonth, dayOfWeek, dayOfYear, month } from '@/lib/indicators';

const BASE_TIMESTAMP = Date.UTC(2024, 4, 15); // 2024-05-15
const formatDate = (ms: number): string =>
  new Date(ms).toISOString().slice(0, 10);

describe('Calendar Indicators', () => {
  const date = '2024-12-31';

  beforeEach(() => {
    delayDateMock.mockReset();
    toUTCMarketCloseMock.mockReset();
    toUTCMarketOpenMock.mockReset();

    delayDateMock.mockImplementation((_, delay = 0) => {
      const copy = new Date(BASE_TIMESTAMP);
      copy.setUTCDate(copy.getUTCDate() - delay);
      return formatDate(copy.getTime());
    });

    const toUTCDate = (value: string) => new Date(`${value}T12:00:00.000Z`);
    toUTCMarketCloseMock.mockImplementation(toUTCDate);
    toUTCMarketOpenMock.mockImplementation(toUTCDate);
  });

  it('returns the UTC month with optional delay', () => {
    expect(month(date)).toBe(5);
    expect(delayDateMock).toHaveBeenCalledWith(date, 0);

    expect(month(date, 31)).toBe(4);
    expect(delayDateMock).toHaveBeenCalledWith(date, 31);
  });

  it('returns the UTC day of week with optional delay', () => {
    expect(dayOfWeek(date)).toBe(3);
    expect(dayOfWeek(date, 1)).toBe(2);
  });

  it('returns the UTC day of month with optional delay', () => {
    expect(dayOfMonth(date)).toBe(15);
    expect(dayOfMonth(date, 1)).toBe(14);
  });

  it('returns the UTC day of year respecting delay', () => {
    expect(dayOfYear(date)).toBe(136);
    expect(dayOfYear(date, 30)).toBe(106);
  });
});
