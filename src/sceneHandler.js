module.exports = { startSceneHandler };

const { Extra } = require("telegraf");
const session = require("telegraf/session");
const Stage = require("telegraf/stage");

// Scenes
const { searchBookScene } = require("./scenes/searchBook");
const { returnBookScene } = require("./scenes/returnBook");
const { availableBooksScene } = require("./scenes/availableBooks");
const { unavailableBooksScene } = require("./scenes/unavailableBooks");
const scenes = [
  searchBookScene,
  returnBookScene,
  availableBooksScene,
  unavailableBooksScene
];
const stage = new Stage(scenes);

// Models
const { User } = require("../models/user");

async function setSession(ctx) {
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
}

function startSceneHandler(bot) {
  bot.use(session());
  bot.use(stage.middleware());

  bot.on("message", async (ctx, next) => {
    await setSession(ctx);
    if (ctx.session.user.role === "Guest") {
      ctx.reply("Аккаунт ожидает подтверждения");
    } else {
      next();
    }
  });

  bot.start(ctx => {
    ctx.reply(`Снова привет, ${ctx.session.user.username}`);
  });

  bot.hears("/books", ctx => {
    ctx.reply("Выберите действие:", Extra.HTML().markup(m =>
      m.inlineKeyboard([
        [
          m.callbackButton("Взять книгу", "/take"),
          m.callbackButton("Вернуть книгу", "/return")
        ], [
          m.callbackButton("Доступные книги", "/available"),
          m.callbackButton("Недоступные книги", "/unavailable")
        ]
      ])
    ));
  });

  bot.action("/take", ctx => {
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
}
