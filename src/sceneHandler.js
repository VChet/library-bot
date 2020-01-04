module.exports = { startSceneHandler };

const { Extra } = require("telegraf");
const session = require("telegraf/session");
const Stage = require("telegraf/stage");

// Scenes
const { searchBookScene } = require("./scenes/searchBook");
const { returnBookScene } = require("./scenes/returnBook");
const { availableBooksScene } = require("./scenes/availableBooks");
const scenes = [
  searchBookScene,
  returnBookScene,
  availableBooksScene,
];
const stage = new Stage(scenes);

// Models
const { User } = require("../models/user");

function startSceneHandler(bot) {
  bot.use(session());
  bot.use(stage.middleware());

  bot.start(ctx => {
    const userData = ctx.from;
    User.findOne({ telegram_id: userData.id }).lean().exec((error, user) => {
      if (error) console.log({ error });

      if (user) {
        ctx.session.user = user;
        ctx.reply(`Снова привет, ${userData.username}`);
      } else {
        const newUser = new User({
          telegram_id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username
        });
        newUser.save();
        ctx.session.user = newUser;
        ctx.reply(`Привет, ${userData.username}`);
      }
    });
  });

  bot.hears("/books", ctx => {
    ctx.reply("Выберите действие:", Extra.HTML().markup(m =>
      m.inlineKeyboard([
        m.callbackButton("Взять книгу", "/books take"),
        m.callbackButton("Вернуть книгу", "/books return"),
        m.callbackButton("Доступные книги", "/books available"),
      ])
    ));
  });

  bot.action("/books take", ctx => {
    ctx.scene.enter("searchBookScene");
  });

  bot.action("/books return", ctx => {
    ctx.scene.enter("returnBookScene");
  });

  bot.action("/books available", ctx => {
    ctx.scene.enter("availableBooksScene");
  });
}
