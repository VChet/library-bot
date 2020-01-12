const Telegraf = require("telegraf");
const session = require("telegraf/session");

const config = require("./config");
const { socksAgent } = require("./src/components/socksAgent");
const { connectToDB } = require("./database");
const { startSceneHandler } = require("./src/sceneHandler");
const { middleware } = require("./src/middleware");

connectToDB();

const proxy = config.useProxy ? { telegram: { agent: socksAgent } } : {};

const bot = new Telegraf(config.token, proxy);
bot.use(session());
bot.use(middleware);
bot.launch().then(() => console.log(`Bot started as ${bot.options.username}`));

startSceneHandler(bot);
