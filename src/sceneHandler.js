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
const { addBookScene } = require("./scenes/addBook");
const scenes = [
  menuScene,
  searchBookScene,
  returnBookScene,
  availableBooksScene,
  unavailableBooksScene,
  usersScene,
  addBookScene
];
const stage = new Stage(scenes);

// Models
const { User } = require("../models/user");

function startSceneHandler(bot) {
  bot.use(session());
  bot.use(stage.middleware());

  bot.on(["message", "callback_query"], async (ctx, next) => {
    const user = await User.findOne({ telegram_id: ctx.from.id }).lean();
    // Create user if it doesn't exists and update session
    if (!user) {
      const newUser = new User({
        telegram_id: ctx.from.id,
        first_name: ctx.from.first_name,
        last_name: ctx.from.last_name,
        username: ctx.from.username
      });
      await newUser.save();
      ctx.session.user = newUser;
    } else {
      ctx.session.user = user;
    }
    // Update user data in DB if it differs from the ctx.form data
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
        }
      );
    }
    // Check role
    if (config.userValidation && ctx.session.user.role === "Guest") {
      return ctx.reply("Аккаунт ожидает подтверждения");
    }
    ctx.scene.enter("menuScene");
  });

  bot.start(ctx => {
    ctx.scene.enter("menuScene");
  });
}
