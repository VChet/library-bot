/* eslint-disable global-require */
const Telegraf = require("telegraf");
const updateLogger = require("telegraf-update-logger");
const session = require("telegraf/session");

const config = require("./config");
const { connectToDB } = require("./database");
const { socksAgent } = require("./src/components/socksAgent");
const { middleware } = require("./src/middleware");

connectToDB();

let proxy = {};
if (config.useProxy) {
  proxy = { telegram: { agent: socksAgent } };
}

const bot = new Telegraf(config.token, proxy);
bot.use(updateLogger({ colors: true }));
bot.use(session());
bot.use(middleware);
bot.launch().then(() => {
  if (!bot.polling.started) process.exit(1);
  console.log(`Bot started as ${bot.options.username}`);
  require("./src/sceneHandler");
});

module.exports = bot;
