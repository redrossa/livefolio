export function getPxAt(): number {
  const now = new Date();
  const end = new Date(now);
  end.setUTCHours(20, 59, 59, 999); // just before market close so reevaluates at market close
  if (now > end) {
    end.setDate(end.getDate() + 1);
  }
  return end.getTime();
}
