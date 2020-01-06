module.exports = { startSceneHandler };

const { Extra } = require("telegraf");
const session = require("telegraf/session");
const Stage = require("telegraf/stage");

// Scenes
const { searchBookScene } = require("./scenes/searchBook");
const { returnBookScene } = require("./scenes/returnBook");
const { availableBooksScene } = require("./scenes/availableBooks");
const { unavailableBooksScene } = require("./scenes/unavailableBooks");
const { usersScene } = require("./scenes/users");
const scenes = [
  searchBookScene,
  returnBookScene,
  availableBooksScene,
  unavailableBooksScene,
  usersScene
];
const stage = new Stage(scenes);

// Models
const { User } = require("../models/user");

function isAdmin(ctx, next) {
  if (ctx.session.user.role === "Admin") return next();
  ctx.reply("Вам недоступна эта команда");
}

function startSceneHandler(bot) {
  bot.use(session());
  bot.use(stage.middleware());

  bot.on(["message", "callback_query"], async (ctx, next) => {
    if (!ctx.session.user) {
      const userData = ctx.from;
      const user = await User.findOne({ telegram_id: userData.id }).lean();
      if (user) {
        ctx.session.user = user;
      } else {
        const newUser = new User({
          telegram_id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username
        });
        await newUser.save();
        ctx.session.user = newUser;
      }
    }
    if (ctx.session.user.role === "Guest") {
      ctx.reply("Аккаунт ожидает подтверждения");
    } else {
      next();
    }
  });

  bot.start(ctx => {
    ctx.reply(`Снова привет, ${ctx.session.user.username}`);
  });

  bot.hears("/menu", ctx => {
    ctx.reply("Выберите действие:", Extra.HTML().markup(m =>
      m.inlineKeyboard([
        [
          m.callbackButton("Поиск", "/search"),
          m.callbackButton("Вернуть книгу", "/return")
        ], [
          m.callbackButton("Доступные книги", "/available"),
          m.callbackButton("Недоступные книги", "/unavailable")
        ]
      ])
    ));
  });

  bot.action("/search", ctx => {
    ctx.scene.enter("searchBookScene");
  });

  bot.action("/return", ctx => {
    ctx.scene.enter("returnBookScene");
  });

  bot.action("/available", ctx => {
    ctx.scene.enter("availableBooksScene");
  });

  bot.action("/unavailable", ctx => {
    ctx.scene.enter("unavailableBooksScene");
  });

  bot.hears("/admin", isAdmin, ctx => {
    ctx.reply("Меню администратора", Extra.HTML().markup(m =>
      m.inlineKeyboard([
        m.callbackButton("Пользователи", "/users")
      ], [
        m.callbackButton("Добавить книгу", "/book add"),
        m.callbackButton("Редактировать", "/book edit")
      ])
    ));
  });

  bot.action("/users", isAdmin, ctx => {
    ctx.scene.enter("usersScene");
  });
}
