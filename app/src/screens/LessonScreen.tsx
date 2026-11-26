import { useEffect, useRef, useState, type FormEvent } from 'react';
import ProgressBar from '../components/ProgressBar';
import SpeakButton from '../components/SpeakButton';
import { translation, type Word } from '../data';
import type { Lang, Strings } from '../i18n';
import {
  afterAnswer,
  firstTasks,
  isCorrectTyping,
  makeOptions,
  nextBatch,
  STAGE_COUNT,
  stagesPassed,
  type Task,
} from '../lesson';
import { speak } from '../speech';
import { haptic } from '../tg';

/** Сколько ждать после правильного ответа перед следующим вопросом. */
const CORRECT_DELAY_MS = 700;

type Phase =
  | { kind: 'cards'; batch: Word[]; index: number }
  | { kind: 'quiz'; queue: Task[] }
  | { kind: 'done' };

function begin(words: Word[], learned: ReadonlySet<string>): Phase {
  const batch = nextBatch(words, learned);
  return batch.length > 0 ? { kind: 'cards', batch, index: 0 } : { kind: 'done' };
}

interface Props {
  t: Strings;
  lang: Lang;
  unit: number;
  words: Word[];
  learned: string[];
  onProgress: (learned: string[]) => void;
  onExit: () => void;
}

export default function LessonScreen({ t, lang, unit, words, learned, onProgress, onExit }: Props) {
  const [learnedSet, setLearnedSet] = useState(
    () => new Set(learned.filter((en) => words.some((w) => w.en === en))),
  );
  const [phase, setPhase] = useState<Phase>(() => begin(words, learnedSet));

  const totalSteps = words.length * STAGE_COUNT;
  const doneSteps = learnedSet.size * STAGE_COUNT + (phase.kind === 'quiz' ? stagesPassed(phase.queue) : 0);

  const nextCard = () => {
    if (phase.kind !== 'cards') return;
    if (phase.index + 1 < phase.batch.length) setPhase({ ...phase, index: phase.index + 1 });
    else setPhase({ kind: 'quiz', queue: firstTasks(phase.batch) });
  };

  const answer = (correct: boolean) => {
    if (phase.kind !== 'quiz') return;
    const task = phase.queue[0];
    let nowLearned = learnedSet;
    if (correct && task.stage === STAGE_COUNT) {
      nowLearned = new Set(learnedSet).add(task.word.en);
      setLearnedSet(nowLearned);
      onProgress([...nowLearned]);
    }
    const queue = afterAnswer(phase.queue, correct);
    setPhase(queue.length > 0 ? { kind: 'quiz', queue } : begin(words, nowLearned));
  };

  const restart = () => {
    const empty = new Set<string>();
    setLearnedSet(empty);
    onProgress([]);
    setPhase(begin(words, empty));
  };

  return (
    <main className="lesson">
      <div className="lesson-top">
        <button className="icon-btn" onClick={onExit} aria-label={t.close} title={t.close}>
          ✕
        </button>
        <ProgressBar value={totalSteps > 0 ? doneSteps / totalSteps : 0} />
      </div>

      {phase.kind === 'cards' && (
        <WordCard
          key={phase.batch[phase.index].en}
          t={t}
          lang={lang}
          word={phase.batch[phase.index]}
          index={phase.index}
          count={phase.batch.length}
          onNext={nextCard}
        />
      )}

      {phase.kind === 'quiz' &&
        (phase.queue[0].stage === 3 ? (
          <TypingTask key={phase.queue[0].id} t={t} lang={lang} task={phase.queue[0]} onDone={answer} />
        ) : (
          <ChoiceTask key={phase.queue[0].id} t={t} lang={lang} task={phase.queue[0]} words={words} onDone={answer} />
        ))}

      {phase.kind === 'done' && (
        <>
          <div className="lesson-body finished">
            <div className="emoji">🎉</div>
            <h1>{t.wellDone}</h1>
            <p className="hint">{t.unitDone(unit)}</p>
          </div>
          <div className="lesson-bottom">
            <button className="btn primary" onClick={onExit}>
              {t.backToUnits}
            </button>
            <button className="btn ghost" onClick={restart}>
              {t.learnAgain}
            </button>
          </div>
        </>
      )}
    </main>
  );
}

/** Запускает действие с задержкой и отменяет его, если ученик ушёл с экрана. */
function useLater() {
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (action: () => void, ms: number) => {
    timer.current = window.setTimeout(action, ms);
  };
}

interface WordCardProps {
  t: Strings;
  lang: Lang;
  word: Word;
  index: number;
  count: number;
  onNext: () => void;
}

function WordCard({ t, lang, word, index, count, onNext }: WordCardProps) {
  useEffect(() => speak(word.en), [word.en]);

  return (
    <>
      <div className="lesson-body">
        <p className="label">
          {t.newWord} {index + 1}/{count}
        </p>
        <div className="flashcard">
          <div className="prompt">
            <span className="big-word">{word.en}</span>
            <SpeakButton text={word.en} label={t.listen} />
          </div>
          <div className="translation">{translation(word, lang)}</div>
        </div>
      </div>
      <div className="lesson-bottom">
        <button className="btn primary" onClick={onNext}>
          {index + 1 < count ? t.next : t.startPractice}
        </button>
      </div>
    </>
  );
}

interface TaskProps {
  t: Strings;
  lang: Lang;
  task: Task;
  onDone: (correct: boolean) => void;
}

function ChoiceTask({ t, lang, task, words, onDone }: TaskProps & { words: Word[] }) {
  const [options] = useState(() => makeOptions(task.word, words));
  const [picked, setPicked] = useState<string | null>(null);
  const later = useLater();

  // Этап 1: английское слово → выбрать перевод. Этап 2: перевод → выбрать английское слово.
  const reverse = task.stage === 2;
  const answerEn = task.word.en;
  const isWrong = picked !== null && picked !== answerEn;

  const pick = (option: Word) => {
    if (picked !== null) return;
    setPicked(option.en);
    const correct = option.en === answerEn;
    haptic(correct ? 'success' : 'error');
    if (correct) {
      if (reverse) speak(answerEn);
      later(() => onDone(true), CORRECT_DELAY_MS);
    }
  };

  return (
    <>
      <div className="lesson-body">
        <p className="label">{reverse ? t.chooseEnglish : t.chooseTranslation}</p>
        <div className="prompt">
          {reverse ? (
            <span className="prompt-text">{translation(task.word, lang)}</span>
          ) : (
            <>
              <span className="big-word">{answerEn}</span>
              <SpeakButton text={answerEn} label={t.listen} />
            </>
          )}
        </div>
        <div className="options">
          {options.map((option) => {
            let className = 'option';
            if (picked !== null && option.en === answerEn) className += ' correct';
            else if (option.en === picked) className += ' wrong';
            return (
              <button key={option.en} className={className} disabled={picked !== null} onClick={() => pick(option)}>
                {reverse ? option.en : translation(option, lang)}
              </button>
            );
          })}
        </div>
      </div>
      {isWrong && (
        <div className="lesson-bottom">
          <button className="btn primary" onClick={() => onDone(false)}>
            {t.continue}
          </button>
        </div>
      )}
    </>
  );
}

function TypingTask({ t, lang, task, onDone }: TaskProps) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const later = useLater();

  useEffect(() => inputRef.current?.focus(), []);

  const finish = (correct: boolean) => {
    setResult(correct ? 'correct' : 'wrong');
    haptic(correct ? 'success' : 'error');
    speak(task.word.en);
    if (correct) later(() => onDone(true), CORRECT_DELAY_MS);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (result === 'wrong') onDone(false);
    else if (result === null && value.trim()) finish(isCorrectTyping(value, task.word));
  };

  return (
    <form className="lesson-form" onSubmit={submit}>
      <div className="lesson-body">
        <p className="label">{t.typeEnglish}</p>
        <div className="prompt">
          <span className="prompt-text">{translation(task.word, lang)}</span>
        </div>
        <input
          ref={inputRef}
          className={result ? `answer-input ${result}` : 'answer-input'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          readOnly={result !== null}
          placeholder={t.typeHere}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="done"
        />
        {result === 'correct' && <p className="feedback correct">{t.correct}</p>}
        {result === 'wrong' && (
          <p className="feedback wrong">
            {t.correctAnswer} <b>{task.word.en}</b>
          </p>
        )}
      </div>
      <div className="lesson-bottom">
        {result === null && (
          <>
            <button type="submit" className="btn primary" disabled={!value.trim()}>
              {t.check}
            </button>
            <button type="button" className="btn ghost" onClick={() => finish(false)}>
              {t.dontKnow}
            </button>
          </>
        )}
        {result === 'wrong' && (
          <button type="submit" className="btn primary">
            {t.continue}
          </button>
        )}
      </div>
    </form>
  );
}
