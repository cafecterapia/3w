export function stripTime(d: Date) {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}

export function addDays(d: Date, days: number) {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  return n;
}

export function addMonths(d: Date, m: number) {
  const n = new Date(d);
  n.setMonth(n.getMonth() + m);
  return n;
}

export function startOfWeek(d: Date) {
  const n = stripTime(d);
  const day = n.getDay();
  return addDays(n, -day);
}

export function startOfMonth(d: Date) {
  const n = stripTime(d);
  n.setDate(1);
  return n;
}

export function endOfMonth(d: Date) {
  const n = startOfMonth(d);
  n.setMonth(n.getMonth() + 1);
  n.setDate(0);
  n.setHours(23, 59, 59, 999);
  return n;
}

export function startOfCalendar(d: Date) {
  const first = startOfMonth(d);
  const w = first.getDay();
  return addDays(first, -w);
}

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function key(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function fmtTime(d: Date) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(d);
}

export function durationLabel(s: { start: Date; end: Date }) {
  const mins = Math.round((s.end.getTime() - s.start.getTime()) / 60000);
  return `${mins} min`;
}

export function filterSlots<T extends { start: Date }>(list: T[], q: string): T[] {
  if (!q.trim()) return list;
  const L = q.toLowerCase();
  return list.filter((s) => fmtTime(s.start).toLowerCase().includes(L));
}
