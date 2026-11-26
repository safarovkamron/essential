import ProgressBar from '../components/ProgressBar';
import { UNITS_PER_BOOK, unitStats, type Progress } from '../data';
import type { Strings } from '../i18n';

interface Props {
  t: Strings;
  book: number;
  progress: Progress;
  onBack: () => void;
  onOpen: (unit: number) => void;
}

const UNITS = Array.from({ length: UNITS_PER_BOOK }, (_, i) => i + 1);

export default function UnitsScreen({ t, book, progress, onBack, onOpen }: Props) {
  return (
    <main className="page">
      <header className="top">
        <button className="icon-btn" onClick={onBack} aria-label={t.back} title={t.back}>
          ←
        </button>
        <h1>Essential {book}</h1>
      </header>
      <p className="hint">{t.chooseUnit}</p>

      <div className="grid">
        {UNITS.map((unit) => {
          const { total, learned } = unitStats(book, unit, progress);
          const done = total > 0 && learned === total;
          return (
            <button
              key={unit}
              className={done ? 'tile done' : 'tile'}
              disabled={total === 0}
              onClick={() => onOpen(unit)}
            >
              <span className="tile-title">Unit {unit}</span>
              {total > 0 && (
                <>
                  <span className="tile-sub">
                    {done ? '✓ ' : ''}
                    {learned}/{total}
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
