const Telegraf = require("telegraf");
const config = require("../config");
const session = require("telegraf/session");
const Stage = require("telegraf/stage");
const { leave } = Stage;
const Agent = require("socks5-https-client/lib/Agent");

const { scenes } = require("./scenes/index");

const stage = new Stage(scenes);
stage.command("cancel", leave());

const socksAgent = new Agent({
  socksHost: config.socks.host,
  socksPort: parseInt(config.socks.port),
  socksUsername: config.socks.username,
  socksPassword: config.socks.password,
});

const bot = new Telegraf(config.token, {
  telegram: { agent: socksAgent }
});

bot.use(session());
bot.use(stage.middleware());

bot.start(async ctx => {
  ctx.scene.enter("searchBookScene");
});

async function startBot() {
  await bot.launch();
  console.log(`Bot started as ${bot.options.username}`);
}

module.exports = {
  startBot
};
