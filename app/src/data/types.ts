/** Слово в том виде, в котором его записывает учитель: перевод может быть строкой или списком. */
export interface RawWord {
  en: string;
  uz: string | string[];
  ru: string | string[];
}

/** Слово внутри приложения: переводы всегда списком. */
export interface Word {
  en: string;
  uz: string[];
  ru: string[];
}
