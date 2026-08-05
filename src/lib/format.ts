export const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);

export const brlCompact = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: Math.abs(value) >= 10000 ? "compact" : "standard",
    maximumFractionDigits: Math.abs(value) >= 10000 ? 1 : 2,
  }).format(value ?? 0);

export const pct = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 }).format(value || 0);

/** Parses "1.234,56" or "1234.56" into a number. */
export function parseBRL(input: string): number {
  if (!input) return 0;
  const cleaned = input.replace(/[^\d,.-]/g, "");
  const normalized =
    cleaned.includes(",") && cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
      ? cleaned.replace(/\./g, "").replace(",", ".")
      : cleaned.replace(/,/g, "");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

/** Date-only helpers (no timezone drift). */
export function toDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

export const isoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const formatDate = (iso: string) =>
  toDate(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export const formatDayMonth = (iso: string) =>
  toDate(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

export const monthLabel = (date: Date) =>
  date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

export const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const WEEKDAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
export function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, date.getDate());
}
export function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}