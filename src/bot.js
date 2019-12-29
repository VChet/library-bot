const Telegraf = require("telegraf");
const session = require("telegraf/session");
const Stage = require("telegraf/stage");
const Agent = require("socks5-https-client/lib/Agent");

// Bot initialisation
const config = require("../config");
const { scenes } = require("./scenes/index");
const { leave } = Stage;

const socksAgent = new Agent({
  socksHost: config.socks.host,
  socksPort: parseInt(config.socks.port),
  socksUsername: config.socks.username,
  socksPassword: config.socks.password,
});

const bot = new Telegraf(config.token, {
  telegram: { agent: socksAgent }
});

exports.startBot = async function() {
  await bot.launch();
  console.log(`Bot started as ${bot.options.username}`);
}

// User requests handling
const { User } = require("../models/user");
const stage = new Stage(scenes);

// FIXME: what is this for?
stage.command("cancel", leave());

bot.use(session());
bot.use(stage.middleware());

bot.start(ctx => {
  const userData = ctx.from;
  User.findOne({ telegram_id: userData.id }).lean().exec((error, user) => {
    if (error) console.log({ error });

    if (user) {
      ctx.reply(`Снова привет, ${userData.username}`);
    } else {
      const newUser = new User({
        telegram_id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username
      });
      newUser.save();
      ctx.reply(`Привет, ${userData.username}`);
    }
  })
});

bot.command('take_book', ctx => {
  ctx.scene.enter("searchBookScene");
});
