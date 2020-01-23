const { User } = require("../src/db/User");
const { replyWithError } = require("./components/error");
const config = require("../config");

function updateUser(ctx) {
  if (
    ctx.session.user.first_name !== ctx.from.first_name ||
    ctx.session.user.last_name !== ctx.from.last_name ||
    ctx.session.user.username !== ctx.from.username
  ) {
    User.changeData({
      telegram_id: ctx.from.id,
      first_name: ctx.from.first_name,
      last_name: ctx.from.last_name,
      username: ctx.from.username
    });
  }
}

async function middleware(ctx, next) {
  try {
    // Update session data
    let user = await User.isExists(ctx.from.id);
    if (!user) {
      const userData = {
        telegram_id: ctx.from.id,
        first_name: ctx.from.first_name,
        last_name: ctx.from.last_name,
        username: ctx.from.username
      };
      user = await User.addOne(userData);
    }
    ctx.session.user = user;
    // Update DB data
    updateUser(ctx);
    // Check if user is validated
    if (config.userValidation && ctx.session.user.role === "Guest") {
      return ctx.reply("Аккаунт ожидает подтверждения");
    }
    next();
  } catch (error) {
    replyWithError(ctx, error);
  }
}

module.exports = { middleware };
