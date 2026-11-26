import 'dotenv/config';
import { Bot, InlineKeyboard } from 'grammy';

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('BOT_TOKEN не найден. Вставьте токен от @BotFather в файл bot/.env');
  process.exit(1);
}

// https-ссылка на приложение со словами. Появится позже, пока может быть пустой.
const webAppUrl = process.env.WEBAPP_URL;

const bot = new Bot(token);

bot.command('start', async (ctx) => {
  const keyboard = webAppUrl
    ? new InlineKeyboard().webApp('📚 Ochish', webAppUrl)
    : undefined;

  await ctx.reply('Salom! 👋 Bot ishlayapti.', { reply_markup: keyboard });
});

bot.catch((err) => {
  console.error('Ошибка бота:', err.error);
});

bot.start({
  onStart: (me) => console.log(`Бот @${me.username} запущен. Остановить: Ctrl+C`),
});
