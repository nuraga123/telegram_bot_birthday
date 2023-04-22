const TelegramApi = require("node-telegram-bot-api");

const token = "5693024074:AAE8oyt9iprrSjqX44abVO78uO82tGjBdVM";

const bot = new TelegramApi(token, { polling: true });

const chat = {};

const start = () => {
  bot.setMyCommands([
    { command: "/start", description: "старт" },
    { command: "/info", description: "информация о тебе" },
    { command: "/birthday", description: "день рождения" },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    const fullname = `${msg.from.first_name} ${msg.from.last_name}`;
    console.log(msg);

    // logic
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

    if (text === "/start") {
      await bot.sendSticker(
        chatId,
        "https://stickerswiki.ams3.cdn.digitaloceanspaces.com/PrettyMind_Birthday/765034.512.webp"
      );
      return bot.sendMessage(
        chatId,
        `привет я бот который не дасть забыть тебе и твоим друзьям день рождение`
      );
    }

    if (text === "/info") {
      return bot.sendMessage(chatId, `тебя зовут ${fullname}`);
    }

    if (text === "/birthday") {
      const randomNumber = 10;
      chat[chatId] = randomNumber;
      return bot.sendMessage();
    }

    return bot.sendMessage(chatId, "Я тебя не понял");
  });
};

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `Привет! Я бот, 
    который поможет тебе не забыть о днях рождения твоих друзей и близких. 
    Просто отправь мне свою дату рождения в формате ДД.ММ.ГГГГ.`
  );
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

start();
