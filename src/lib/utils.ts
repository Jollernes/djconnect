import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amountMinorUnits: number, currency = "DKK") {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountMinorUnits / 100);
}

export function formatDKK(amount: number) {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDKKFrom(amount: number) {
  return `Fra ${formatDKK(amount)} ekskl. moms`;
}

function toDate(input: string | Date) {
  return typeof input === "string" ? new Date(input) : input;
}

export function formatDanishDate(date: string | Date) {
  const d = toDate(date);
  const weekday = new Intl.DateTimeFormat("da-DK", { weekday: "long" }).format(d);
  const day = new Intl.DateTimeFormat("da-DK", { day: "numeric" }).format(d);
  const month = new Intl.DateTimeFormat("da-DK", { month: "long" }).format(d);
  const year = new Intl.DateTimeFormat("da-DK", { year: "numeric" }).format(d);
  return `${weekday} d. ${day}. ${month} ${year}`;
}

export function formatDanishDateShort(date: string | Date) {
  return new Intl.DateTimeFormat("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(toDate(date));
}

export function formatDate(date: string | Date, opts: Intl.DateTimeFormatOptions = {}) {
  const d = toDate(date);
  return d.toLocaleDateString("da-DK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...opts,
  });
}

export function formatDateTime(date: string | Date) {
  const d = toDate(date);
  return d.toLocaleString("da-DK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function daysUntil(date: string | Date) {
  const d = toDate(date);
  const diff = d.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function pluralize(n: number, singular: string, plural?: string) {
  return `${n} ${n === 1 ? singular : plural ?? `${singular}s`}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
