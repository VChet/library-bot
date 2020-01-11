module.exports = { startSceneHandler };

const session = require("telegraf/session");
const Stage = require("telegraf/stage");

const config = require("../config");

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
    if (ctx.session.user.role === "Guest" && config.userValidation) {
      const user = await User.findOne({ telegram_id: ctx.session.user.telegram_id }).lean();
      if (user.role === "Guest") {
        ctx.reply("Аккаунт ожидает подтверждения");
      } else {
        ctx.session.user = user;
      }
    } else {
      if (
        ctx.session.user.first_name !== ctx.from.first_name ||
        ctx.session.user.last_name !== ctx.from.last_name ||
        ctx.session.user.username !== ctx.from.username
      ) {
        User.findOneAndUpdate(
          { telegram_id: ctx.from.id },
          { $set:
            {
              first_name: ctx.from.first_name,
              last_name: ctx.from.last_name,
              username: ctx.from.username
            }
          },
          { new: true },
          (error) => {
            if (error) console.log(error);
            next();
          }
        );
      }
      ctx.scene.enter("menuScene");
    }
  });

  bot.start(ctx => {
    ctx.scene.enter("menuScene");
  });
}
