import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import path from 'path';

const TECH_COLORS = [
  'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20',
  'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-500/20',
  'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20',
  'bg-lime-100 text-lime-700 dark:bg-lime-500/10 dark:text-lime-400 border-lime-200 dark:border-lime-500/20',
  'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  'bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 border-teal-200 dark:border-teal-500/20',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20',
  'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 border-sky-200 dark:border-sky-500/20',
  'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
  'bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 border-violet-200 dark:border-violet-500/20',
  'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
  'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-500/20',
  'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400 border-pink-200 dark:border-pink-500/20',
  'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
];

export function getColorForTechnology(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % TECH_COLORS.length);

  return TECH_COLORS[index];
}


export function normalizePrismaData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'object') {
    // Obsługa Decimal z Prisma
    if (typeof data.toNumber === 'function') {
      return data.toNumber();
    }

    // Obsługa tablic
    if (Array.isArray(data)) {
      return data.map(normalizePrismaData);
    }

    // Obsługa Date (opcjonalnie, Next.js czasem sobie radzi, ale bezpieczniej zamienić na string)
    if (data instanceof Date) {
      return data.toISOString();
    }

    // Rekurencja dla obiektów
    const newObj: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newObj[key] = normalizePrismaData(data[key]);
      }
    }
    return newObj;
  }

  return data;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}