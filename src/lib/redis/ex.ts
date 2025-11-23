export function getExAt(): number {
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);
  return Math.floor(end.getTime() / 1000);
}
