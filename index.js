const TelegramApi = require("node-telegram-bot-api");
const fs = require("fs");
const token = "5693024074:AAE8oyt9iprrSjqX44abVO78uO82tGjBdVM";
const bot = new TelegramApi(token, { polling: true });

const rawData = fs.readFileSync("users.json");
const users = JSON.parse(rawData);
const stiker =
  "https://stickerswiki.ams3.cdn.digitaloceanspaces.com/PrettyMind_Birthday/765034.512.webp";
// validate date
function isValidDate(inputDate) {
  return (
    /^\d{2}\.\d{2}\.\d{4}$/.test(inputDate) &&
    !isNaN(Date.parse(inputDate.replace(/\./g, "-")))
  );
}

function isToday(dateStr) {
  const now = new Date();
  const [day, month] = dateStr.split(".");
  const dateToCheck = new Date(
    now.getFullYear(),
    parseInt(month) - 1,
    parseInt(day)
  );

  if (
    dateToCheck.getDate() === now.getDate() &&
    dateToCheck.getMonth() === now.getMonth()
  ) {
    console.log(`Дата ${dateStr} сегодня!`);
    return true;
  } else {
    return false;
  }
}

function getBirthdayOfnextWeek(people, id) {
  const today = new Date();
  // day + 7 = nextWeek
  const nextWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 7
  );

  for (let person of people) {
    // ["25", "04", "2023"]
    const parts = person.date.split(".");
    //                          year       month      day
    const birthday = new Date(parts[2], parts[1] - 1, parts[0]);

    if (
      birthday.getDate() === nextWeek.getDate() &&
      birthday.getMonth() === nextWeek.getMonth()
    ) {
      bot.sendMessage(
        id,
        `У ${person.fullname} через 7 дней будет день рождения!`
      );
    }
  }
}

const start = () => {
  bot.setMyCommands([
    { command: "/start", description: "старт" },
    {
      command: "/info",
      description: "информация о всех у кого день рождение ?",
    },
    { command: "/birthday", description: "день рождения" },
    { command: "/today__birthday", description: "сегодня чьи рождения есть ?" },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const username = msg.from.username === undefined ? "" : msg.from.username;

    const firstname =
      msg.from.first_name === undefined ? "" : msg.from.first_name;

    const lastname = msg.from.last_name === undefined ? "" : msg.from.last_name;

    const fullname =
      firstname && lastname
        ? `${firstname} ${lastname}`
        : firstname
        ? `${firstname}`
        : username
        ? `${username}`
        : `${userId}`;

    console.log(msg);
    if (text === "/start") {
      bot.sendMessage(
        chatId,
        `привет ${fullname} напиши свою дату рождения 04.04.1995?`
      );
    }

    if (isValidDate(text)) {
      const userExists = users.some((user) => {
        return user.fullname === fullname && user.date === text;
      });

      if (!userExists) {
        console.log(text.length);
        users.push({
          fullname: fullname,
          date: text,
        });

        const updatedData = JSON.stringify(users);
        fs.writeFileSync("users.json", updatedData);

        await bot.sendMessage(chatId, "сохраненно");
        console.log(users);
      } else {
        await bot.sendMessage(chatId, "Вы уже сохранились");
      }
    }

    if (text === "/info") {
      users.map((user, index) =>
        bot.sendMessage(chatId, `${index + 1}) ${user.fullname} ${user.date}`)
      );
    }

    if (text === "/today__birthday") {
      await users.filter((user) => {
        if (user.fullname !== fullname) {
          if (isToday(user.date)) {
            bot.sendMessage(chatId, `Дата ${user.fullname} сегодня!`);
          } else bot.sendMessage(chatId, "сегодня ни у кого нет дня рождения");
        }
      });
    }

    if (users.length) return getBirthdayOfnextWeek(users, chatId);
  });
};

start();
