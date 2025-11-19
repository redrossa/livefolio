export function percentChange(a: number, b: number): number {
  return ((b - a) / a) * 100;
}

export function absoluteChanges(arr: number[]): number[] {
  return arr.slice(1).map((a, i) => a - arr[i]);
}

export function relativeChanges(arr: number[]): number[] {
  return arr.slice(1).map((a, i) => (a - arr[i]) / arr[i]);
}

export function smoothing(arr: number[], n: number, a = 2 / (n + 1)): number {
  let ema = arr[0];
  for (let i = 1; i < arr.length; i++) {
    ema = arr[i] * a + ema * (1 - a);
  }
  return ema;
}

export function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b) / arr.length;
}
