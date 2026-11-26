import type { Lang } from '../i18n';

export default function LanguageScreen({ onChoose }: { onChoose: (lang: Lang) => void }) {
  return (
    <main className="page center">
      <div className="emoji">📚</div>
      <h1>Essential Words</h1>
      <p className="hint">Tilni tanlang · Выберите язык</p>
      <div className="stack">
        <button className="btn primary" onClick={() => onChoose('uz')}>
          🇺🇿 O'zbekcha
        </button>
        <button className="btn primary" onClick={() => onChoose('ru')}>
          🇷🇺 Русский
        </button>
      </div>
    </main>
  );
}
