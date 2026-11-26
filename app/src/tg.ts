export const tg = window.Telegram?.WebApp;

/** true, когда приложение открыто внутри Telegram, а не в обычном браузере. */
export const inTelegram = Boolean(tg?.initData);

/** Лёгкая вибрация телефона на правильный или неправильный ответ. */
export function haptic(type: 'success' | 'error') {
  if (tg && inTelegram && tg.isVersionAtLeast('6.1')) {
    tg.HapticFeedback.notificationOccurred(type);
  }
}
