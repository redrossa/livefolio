import { resolveLocales } from '@/lib/intl/locales';

export async function dollarFormatter(value: number) {
  const locales = await resolveLocales();
  const dollarFormatter = new Intl.NumberFormat(locales, {
    style: 'currency',
    currency: 'USD',
  });
  return dollarFormatter.format(value);
}

export async function percentFormatter(value: number) {
  const locales = await resolveLocales();
  const percentFormatter = new Intl.NumberFormat(locales, {
    style: 'unit',
    unit: 'percent',
    unitDisplay: 'narrow',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return percentFormatter.format(value);
}

export async function percentReturnsFormatter(value: number) {
  const locales = await resolveLocales();
  const percentFormatter = new Intl.NumberFormat(locales, {
    style: 'unit',
    unit: 'percent',
    unitDisplay: 'narrow',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    signDisplay: 'exceptZero',
  });
  return percentFormatter.format(value);
}
