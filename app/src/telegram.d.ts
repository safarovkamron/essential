// Описание той части Telegram Mini App API, которой мы пользуемся.
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface TelegramWebApp {
  ready(): void;
  expand(): void;
  colorScheme: 'light' | 'dark';
  initDataUnsafe: { user?: TelegramUser };
}

interface Window {
  Telegram?: { WebApp: TelegramWebApp };
}
