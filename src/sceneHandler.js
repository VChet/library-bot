module.exports = { startSceneHandler };

const { Extra } = require("telegraf");
const session = require("telegraf/session");
const Stage = require("telegraf/stage");

// Scenes
const { menuScene } = require("./scenes/menu");
const { searchBookScene } = require("./scenes/searchBook");
const { returnBookScene } = require("./scenes/returnBook");
const { availableBooksScene } = require("./scenes/availableBooks");
const { unavailableBooksScene } = require("./scenes/unavailableBooks");
const { usersScene } = require("./scenes/users");
const scenes = [
  menuScene,
  searchBookScene,
  returnBookScene,
  availableBooksScene,
  unavailableBooksScene,
  usersScene
];
const stage = new Stage(scenes);

// Models
const { User } = require("../models/user");

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
    ctx.reply(
      `Снова привет, ${ctx.session.user.username}`,
      Extra.HTML().markup(m => {
        return m.inlineKeyboard([m.callbackButton("Меню", "/menu")]);
      })
    );
  });

  bot.action("/menu", ctx => {
    ctx.scene.enter("menuScene");
  });
}
