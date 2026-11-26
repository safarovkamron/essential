import 'dotenv/config';
import { Bot, InlineKeyboard } from 'grammy';

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('BOT_TOKEN не найден. Вставьте токен от @BotFather в файл bot/.env');
  process.exit(1);
}

// https-ссылка на приложение со словами. Пока её нет, бот работает без кнопки приложения.
const webAppUrl = process.env.WEBAPP_URL?.trim() || null;
if (webAppUrl && !webAppUrl.startsWith('https://')) {
  console.error('WEBAPP_URL должен начинаться с https://');
  process.exit(1);
}

type Lang = 'uz' | 'ru';

const TEXTS: Record<Lang, { chosen: string; pressButton: string; open: string; noApp: string }> = {
  uz: {
    chosen: "Til: O'zbekcha ✅",
    pressButton: "So'zlarni o'rganish uchun tugmani bosing.",
    open: '📚 Ochish',
    noApp: 'Ilova hali ulanmagan. Tez orada! ⏳',
  },
  ru: {
    chosen: 'Язык: Русский ✅',
    pressButton: 'Нажмите кнопку, чтобы учить слова.',
    open: '📚 Открыть',
    noApp: 'Приложение ещё не подключено. Скоро! ⏳',
  },
};

/** Ссылка на приложение с выбранным языком, например https://.../?lang=uz */
function appUrl(base: string, lang: Lang): string {
  const url = new URL(base);
  url.searchParams.set('lang', lang);
  return url.toString();
}

const bot = new Bot(token);

const askLanguage = new InlineKeyboard().text("🇺🇿 O'zbekcha", 'lang:uz').text('🇷🇺 Русский', 'lang:ru');

bot.command(['start', 'language'], async (ctx) => {
  await ctx.reply('Tilni tanlang · Выберите язык', { reply_markup: askLanguage });
});

bot.callbackQuery(['lang:uz', 'lang:ru'], async (ctx) => {
  const lang: Lang = ctx.callbackQuery.data === 'lang:ru' ? 'ru' : 'uz';
  const t = TEXTS[lang];
  await ctx.answerCallbackQuery();

  if (!webAppUrl) {
    await ctx.editMessageText(`${t.chosen}\n${t.noApp}`);
    return;
  }

  const url = appUrl(webAppUrl, lang);

  // Кнопка «Открыть» слева от поля ввода. Telegram запоминает её для этого ученика.
  if (ctx.chat) {
    await ctx.api.setChatMenuButton({
      chat_id: ctx.chat.id,
      menu_button: { type: 'web_app', text: t.open, web_app: { url } },
    });
  }

  await ctx.editMessageText(`${t.chosen}\n${t.pressButton}`, {
    reply_markup: new InlineKeyboard().webApp(t.open, url),
  });
});

bot.catch((err) => {
  console.error('Ошибка бота:', err.error);
});

bot.start({
  onStart: (me) => console.log(`Бот @${me.username} запущен. Остановить: Ctrl+C`),
});
