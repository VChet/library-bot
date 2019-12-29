const Telegraf = require("telegraf");
const session = require("telegraf/session");
const Stage = require("telegraf/stage");
const Agent = require("socks5-https-client/lib/Agent");

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

const stage = new Stage(scenes);
stage.command("cancel", leave());

bot.use(session());
bot.use(stage.middleware());

bot.start(ctx => {
  ctx.scene.enter("searchBookScene");
});

async function startBot() {
  await bot.launch();
  console.log(`Bot started as ${bot.options.username}`);
}

module.exports = {
  startBot
};
