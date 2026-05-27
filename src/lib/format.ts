export function fmt(n: number, d = 4): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function fmtN(n: number, d: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function randomWalk(n: number, base: number, vol: number): number[] {
  const out: number[] = [base];
  for (let i = 1; i < n; i++) out.push(out[i - 1] + (Math.random() - 0.5) * vol);
  return out;
}

export function shade(hex: string, pct: number): string {
  const c = hex.replace('#', '');
  const num = parseInt(c, 16);
  let r = (num >> 16) + Math.round(2.55 * pct);
  let g = ((num >> 8) & 0xff) + Math.round(2.55 * pct);
  let b = (num & 0xff) + Math.round(2.55 * pct);
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
