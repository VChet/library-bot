const Telegraf = require("telegraf");
const Agent = require("socks5-https-client/lib/Agent");

const config = require("./config");
const { connectToDB } = require("./database");
const { startSceneHandler } = require("./src/sceneHandler");

connectToDB();

let proxy = {};
if (config.useProxy) {
  const socksAgent = new Agent({
    socksHost: config.proxy.host,
    socksPort: parseInt(config.proxy.port),
    socksUsername: config.proxy.username,
    socksPassword: config.proxy.password,
  });
  proxy = { telegram: { agent: socksAgent } };
}

const bot = new Telegraf(config.token, proxy);
bot.launch().then(() => console.log(`Bot started as ${bot.options.username}`));

startSceneHandler(bot);
