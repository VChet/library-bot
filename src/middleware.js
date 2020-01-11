const { User } = require("../models/user");
const config = require("../config");

async function createUser(data) {
  const newUser = new User({
    telegram_id: data.id,
    first_name: data.first_name,
    last_name: data.last_name,
    username: data.username
  });
  await newUser.save();
  return newUser;
}

function updateUser(ctx) {
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
      (error) => error && console.log(error)
    );
  }
}

async function middleware(ctx, next) {
  // Update session data
  let user = await User.findOne({ telegram_id: ctx.from.id }).lean();
  if (!user) user = await createUser(ctx.from);
  ctx.session.user = user;
  // Update DB data
  updateUser(ctx);
  // Check if user is validated
  if (config.userValidation && ctx.session.user.role === "Guest") {
    return ctx.reply("Аккаунт ожидает подтверждения");
  }
  next();
}

module.exports = { middleware };
