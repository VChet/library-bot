/* eslint-disable global-require */
require("dotenv").config();
const Telegraf = require("telegraf");
const updateLogger = require("telegraf-update-logger");
const session = require("telegraf/session");

const { connectToDB } = require("./database");
const { socksAgent } = require("./src/components/socksAgent");
const { middleware } = require("./src/middleware");

connectToDB();

let proxy = {};
if (process.env.PROXY_ENABLED === "true") {
  proxy = { telegram: { agent: socksAgent } };
}

const bot = new Telegraf(process.env.BOT_TOKEN, proxy);
bot.use(updateLogger({
  filter: update => !update.chosen_inline_result,
  colors: true
}));
bot.use(session());
bot.use(middleware);
bot.launch().then(() => {
  if (!bot.polling.started) process.exit(1);
  console.log(`Bot started as ${bot.options.username}`);
  require("./src/sceneHandler");
});

module.exports = bot;
