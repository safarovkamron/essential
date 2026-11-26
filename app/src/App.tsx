import { useEffect, useMemo, useState } from 'react';
import { getUnitWords, progressKey, unitsWithWords, type Progress } from './data';
import { isLang, STRINGS, type Lang } from './i18n';
import BooksScreen from './screens/BooksScreen';
import LanguageScreen from './screens/LanguageScreen';
import LessonScreen from './screens/LessonScreen';
import UnitsScreen from './screens/UnitsScreen';
import { load, loadMany, save } from './storage';

type Screen =
  | { name: 'books' }
  | { name: 'units'; book: number }
  | { name: 'lesson'; book: number; unit: number };

function parseList(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState<Lang | null>(null);
  const [progress, setProgress] = useState<Progress>({});
  const [screen, setScreen] = useState<Screen>({ name: 'books' });

  useEffect(() => {
    (async () => {
      // Язык приходит из бота в ссылке (?lang=uz), иначе берём сохранённый.
      const urlLang = new URLSearchParams(window.location.search).get('lang');
      const savedLang = await load('lang');
      if (isLang(urlLang) && urlLang !== savedLang) save('lang', urlLang);

      const keys = unitsWithWords().map((u) => progressKey(u.book, u.unit));
      const stored = await loadMany(keys);
      const loaded: Progress = {};
      for (const [key, value] of Object.entries(stored)) loaded[key] = parseList(value);

      setLang(isLang(urlLang) ? urlLang : isLang(savedLang) ? savedLang : null);
      setProgress(loaded);
      setReady(true);
    })();
  }, []);

  const lessonWords = useMemo(
    () => (screen.name === 'lesson' ? getUnitWords(screen.book, screen.unit) : []),
    [screen],
  );

  const chooseLang = (next: Lang) => {
    setLang(next);
    save('lang', next);
  };

  const saveUnit = (book: number, unit: number, learned: string[]) => {
    const key = progressKey(book, unit);
    setProgress((prev) => ({ ...prev, [key]: learned }));
    save(key, JSON.stringify(learned));
  };

  if (!ready) return null;
  if (!lang) return <LanguageScreen onChoose={chooseLang} />;

  const t = STRINGS[lang];

  switch (screen.name) {
    case 'books':
      return (
        <BooksScreen
          t={t}
          lang={lang}
          progress={progress}
          onLang={chooseLang}
          onOpen={(book) => setScreen({ name: 'units', book })}
        />
      );
    case 'units':
      return (
        <UnitsScreen
          t={t}
          book={screen.book}
          progress={progress}
          onBack={() => setScreen({ name: 'books' })}
          onOpen={(unit) => setScreen({ name: 'lesson', book: screen.book, unit })}
        />
      );
    case 'lesson':
      return (
        <LessonScreen
          key={`${screen.book}-${screen.unit}`}
          t={t}
          lang={lang}
          unit={screen.unit}
          words={lessonWords}
          learned={progress[progressKey(screen.book, screen.unit)] ?? []}
          onProgress={(learned) => saveUnit(screen.book, screen.unit, learned)}
          onExit={() => setScreen({ name: 'units', book: screen.book })}
        />
      );
  }
}
