// Описание той части Telegram Mini App API, которой мы пользуемся.
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramCloudStorage {
  setItem(key: string, value: string, callback?: (error: string | null, stored?: boolean) => void): void;
  getItems(keys: string[], callback: (error: string | null, values?: Record<string, string>) => void): void;
}

interface TelegramHapticFeedback {
  notificationOccurred(type: 'error' | 'success' | 'warning'): void;
}

interface TelegramWebApp {
  ready(): void;
  expand(): void;
  /** Пустая строка, если страница открыта не в Telegram. */
  initData: string;
  initDataUnsafe: { user?: TelegramUser };
  isVersionAtLeast(version: string): boolean;
  CloudStorage: TelegramCloudStorage;
  HapticFeedback: TelegramHapticFeedback;
}

interface Window {
  Telegram?: { WebApp: TelegramWebApp };
}
