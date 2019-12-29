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
const stage = new Stage(scenes);
stage.command("cancel", leave());

bot.use(session());
bot.use(stage.middleware());

bot.start(ctx => {
  ctx.scene.enter("searchBookScene");
});
