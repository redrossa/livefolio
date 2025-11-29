export function dollarFormatter(locales: Intl.LocalesArgument, value: number) {
  const dollarFormatter = new Intl.NumberFormat(locales, {
    style: 'currency',
    currency: 'USD',
  });
  return dollarFormatter.format(value);
}

export function percentFormatter(locales: Intl.LocalesArgument, value: number) {
  const percentFormatter = new Intl.NumberFormat(locales, {
    style: 'unit',
    unit: 'percent',
    unitDisplay: 'narrow',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return percentFormatter.format(value);
}

export function percentReturnsFormatter(
  locales: Intl.LocalesArgument,
  value: number,
) {
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
