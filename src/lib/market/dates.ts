/**
 * Converts any timezone date time to US market date in string YYYY-MM-DD
 * @param date date time
 */
export function toUSMarketDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Converts date string YYYY-MM-DD to UTC market close date time
 * @param date date string
 */
export function toUTCMarketClose(date: string): Date {
  const utc = new Date(date);
  return new Date(
    Date.UTC(utc.getFullYear(), utc.getMonth(), utc.getDate(), 14, 30),
  );
}

/**
 * Converts date string YYYY-MM-DD to UTC market open date time
 * @param date date string
 */
export function toUTCMarketOpen(date: string): Date {
  const utc = new Date(date);
  return new Date(
    Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate(), 21, 0),
  );
}

/**
 * Delay date string by d days
 * @param date date string
 * @param d days to delay
 */
export function delayDate(date: string, d: number = 0): string {
  const x = new Date(date);
  x.setDate(x.getDate() - d);
  return toUSMarketDateString(x);
}
