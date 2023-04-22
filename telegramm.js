const TelegramBot = require("node-telegram-bot-api");

// Токен вашего бота, полученный от BotFather
const token = "YOUR_TELEGRAM_BOT_TOKEN";

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `Привет! Я бот, 
    который поможет тебе не забыть о днях рождения твоих друзей и близких. 
    Просто отправь мне свою дату рождения в формате ДД.ММ.ГГГГ.`);
});

// Обработчик сообщений с датой рождения
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  // Разбиваем полученную дату на день, месяц и год
  const [day, month, year] = msg.text.split(".");

  // Создаем объект даты рождения
  const birthday = new Date(`${month}/${day}/${year}`);

  // Получаем текущую дату
  const today = new Date();

  // Вычисляем дату ближайшего дня рождения
  const nextBirthday = new Date(
    today.getFullYear(),
    birthday.getMonth(),
    birthday.getDate()
  );

  // Если день рождения уже прошел в этом году, то считаем дату следующего года
  if (nextBirthday < today) {
    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
  }

  // Вычисляем разницу между текущей датой и датой ближайшего дня рождения в днях
  const diffDays = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));

  // Если до дня рождения менее 14 дней, отправляем сообщение
  if (diffDays <= 14) {
    bot.getChatMembersCount(chatId).then((count) => {
      for (let i = 0; i < count; i += 1) {
        bot.getChatMember(chatId, i).then((member) => {
          if (member.user.id !== bot.options.polling.id) {
            bot.sendMessage(
              member.user.id,
              `Через ${diffDays} дней у ${msg.from.first_name} (${msg.text}) день рождения! Не забудьте поздравить его!`
            );
          }
        });
      }
    });
  }
});
