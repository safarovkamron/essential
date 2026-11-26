import ProgressBar from '../components/ProgressBar';
import { BOOK_NUMBERS, bookStats, type Progress } from '../data';
import { LANGS, type Lang, type Strings } from '../i18n';

interface Props {
  t: Strings;
  lang: Lang;
  progress: Progress;
  onLang: (lang: Lang) => void;
  onOpen: (book: number) => void;
}

export default function BooksScreen({ t, lang, progress, onLang, onOpen }: Props) {
  return (
    <main className="page">
      <header className="top">
        <h1>Essential Words</h1>
        <div className="lang-switch" role="group">
          {LANGS.map((l) => (
            <button
              key={l}
              className={l === lang ? 'active' : ''}
              aria-pressed={l === lang}
              onClick={() => onLang(l)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>
      <p className="hint">{t.chooseBook}</p>

      <div className="stack">
        {BOOK_NUMBERS.map((book) => {
          const { total, learned } = bookStats(book, progress);
          return (
            <button key={book} className="card" disabled={total === 0} onClick={() => onOpen(book)}>
              <span className="card-title">Essential {book}</span>
              {total === 0 ? (
                <span className="card-sub">{t.soon}</span>
              ) : (
                <>
                  <span className="card-sub">
                    {t.learned}: {learned} / {total}
                  </span>
                  <ProgressBar value={learned / total} />
                </>
              )}
            </button>
          );
        })}
      </div>
    </main>
  );
}
