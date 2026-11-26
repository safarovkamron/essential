export type Lang = 'uz' | 'ru';

export const LANGS: Lang[] = ['uz', 'ru'];

export function isLang(value: unknown): value is Lang {
  return value === 'uz' || value === 'ru';
}

const uz = {
  chooseBook: 'Kitobni tanlang',
  chooseUnit: 'Unitni tanlang',
  soon: 'Tez orada',
  learned: "O'rganildi",
  back: 'Orqaga',
  close: 'Yopish',
  listen: 'Tinglash',
  newWord: "Yangi so'z",
  next: 'Keyingi',
  startPractice: 'Mashqni boshlash',
  chooseTranslation: 'Tarjimasini tanlang',
  chooseEnglish: 'Inglizchasini tanlang',
  typeEnglish: 'Inglizcha yozing',
  typeHere: "So'zni yozing",
  check: 'Tekshirish',
  dontKnow: 'Bilmayman',
  continue: 'Davom etish',
  correct: "To'g'ri! 👍",
  correctAnswer: "To'g'ri javob:",
  wellDone: 'Barakalla!',
  unitDone: (unit: number) => `Unit ${unit} so'zlari o'rganildi`,
  backToUnits: 'Unitlarga qaytish',
  learnAgain: "Qaytadan o'rganish",
};

export type Strings = typeof uz;

const ru: Strings = {
  chooseBook: 'Выберите книгу',
  chooseUnit: 'Выберите юнит',
  soon: 'Скоро',
  learned: 'Выучено',
  back: 'Назад',
  close: 'Закрыть',
  listen: 'Послушать',
  newWord: 'Новое слово',
  next: 'Далее',
  startPractice: 'Начать упражнения',
  chooseTranslation: 'Выберите перевод',
  chooseEnglish: 'Выберите английское слово',
  typeEnglish: 'Напишите по-английски',
  typeHere: 'Введите слово',
  check: 'Проверить',
  dontKnow: 'Не знаю',
  continue: 'Продолжить',
  correct: 'Правильно! 👍',
  correctAnswer: 'Правильный ответ:',
  wellDone: 'Отлично!',
  unitDone: (unit: number) => `Все слова Unit ${unit} выучены`,
  backToUnits: 'К юнитам',
  learnAgain: 'Учить заново',
};

export const STRINGS: Record<Lang, Strings> = { uz, ru };
