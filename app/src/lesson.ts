import type { Word } from './data/types';

/**
 * Этапы, которые проходит каждое слово:
 * 1 — выбрать перевод английского слова,
 * 2 — выбрать английское слово по переводу,
 * 3 — написать английское слово самому.
 */
export type Stage = 1 | 2 | 3;
export const STAGE_COUNT = 3;

export interface Task {
  id: number;
  word: Word;
  stage: Stage;
}

/** Сколько новых слов учим за один заход. */
export const BATCH_SIZE = 5;
/** Сколько вариантов ответа в тесте. */
export const OPTION_COUNT = 4;
/** Через сколько вопросов вернётся слово, на котором ошиблись. */
const REPEAT_GAP = 2;

let lastId = 0;
function makeTask(word: Word, stage: Stage): Task {
  lastId += 1;
  return { id: lastId, word, stage };
}

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Следующие слова, которые ученик ещё не выучил (в порядке книги). */
export function nextBatch(words: readonly Word[], learned: ReadonlySet<string>): Word[] {
  return words.filter((w) => !learned.has(w.en)).slice(0, BATCH_SIZE);
}

export function firstTasks(batch: readonly Word[]): Task[] {
  return shuffle(batch).map((w) => makeTask(w, 1));
}

/**
 * Очередь вопросов после ответа на первый из них.
 * Правильно — слово переходит на следующий этап (в конец очереди).
 * Ошибка — тот же вопрос вернётся через пару других вопросов.
 */
export function afterAnswer(queue: readonly Task[], correct: boolean): Task[] {
  const [task, ...rest] = queue;
  if (correct) {
    return task.stage < STAGE_COUNT ? [...rest, makeTask(task.word, (task.stage + 1) as Stage)] : rest;
  }
  const at = Math.min(REPEAT_GAP, rest.length);
  return [...rest.slice(0, at), makeTask(task.word, task.stage), ...rest.slice(at)];
}

/** Сколько этапов уже пройдено словами, которые сейчас в очереди. */
export function stagesPassed(queue: readonly Task[]): number {
  return queue.reduce((sum, task) => sum + task.stage - 1, 0);
}

/** Правильный ответ и неправильные варианты из того же юнита, перемешанные. */
export function makeOptions(word: Word, words: readonly Word[]): Word[] {
  const others = shuffle(words.filter((w) => w.en !== word.en)).slice(0, OPTION_COUNT - 1);
  return shuffle([word, ...others]);
}

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[’‘`ʻʼ]/g, "'")
    .replace(/\s+/g, ' ');
}

export function isCorrectTyping(input: string, word: Word): boolean {
  return normalize(input) === normalize(word.en);
}
