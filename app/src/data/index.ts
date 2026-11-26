import type { Lang } from '../i18n';
import { essential1 } from './essential1';
import type { RawWord, Word } from './types';

export type { Word } from './types';

export const BOOK_NUMBERS = [1, 2, 3, 4, 5, 6];
export const UNITS_PER_BOOK = 30;

// Номер книги → номер юнита → слова. Новую книгу добавляйте сюда.
const BOOKS: Record<number, Record<number, RawWord[]>> = {
  1: essential1,
};

/** Какие слова ученик уже выучил: ключ юнита → список английских слов. */
export type Progress = Record<string, string[]>;

const asList = (value: string | string[]) => (Array.isArray(value) ? value : [value]);

export function getUnitWords(book: number, unit: number): Word[] {
  return (BOOKS[book]?.[unit] ?? []).map((w) => ({
    en: w.en,
    uz: asList(w.uz),
    ru: asList(w.ru),
  }));
}

export function unitsWithWords(): { book: number; unit: number }[] {
  return Object.entries(BOOKS).flatMap(([book, units]) =>
    Object.keys(units).map((unit) => ({ book: Number(book), unit: Number(unit) })),
  );
}

export function progressKey(book: number, unit: number): string {
  return `p_${book}_${unit}`;
}

export function translation(word: Word, lang: Lang): string {
  return word[lang].join(', ');
}

export function unitStats(book: number, unit: number, progress: Progress) {
  const words = getUnitWords(book, unit);
  const learned = new Set(progress[progressKey(book, unit)] ?? []);
  return {
    total: words.length,
    learned: words.filter((w) => learned.has(w.en)).length,
  };
}

export function bookStats(book: number, progress: Progress) {
  let total = 0;
  let learned = 0;
  for (let unit = 1; unit <= UNITS_PER_BOOK; unit++) {
    const stats = unitStats(book, unit, progress);
    total += stats.total;
    learned += stats.learned;
  }
  return { total, learned };
}
