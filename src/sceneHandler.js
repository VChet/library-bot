const Stage = require("telegraf/stage");

const { version } = require("../package.json");
const { paginator } = require("./components/paginator");

// Scenes
const { menuScene } = require("./scenes/menu");
const { searchBookScene } = require("./scenes/searchBook");
const { returnBookScene } = require("./scenes/returnBook");
const { availableBooksScene } = require("./scenes/availableBooks");
const { unavailableBooksScene } = require("./scenes/unavailableBooks");
const { usersScene } = require("./scenes/users");
const { addBookScene } = require("./scenes/addBook");
const { editBookScene } = require("./scenes/editBook");
const { uploadBooksScene } = require("./scenes/uploadBooks");
const scenes = [
  menuScene,
  searchBookScene,
  returnBookScene,
  availableBooksScene,
  unavailableBooksScene,
  usersScene,
  addBookScene,
  editBookScene,
  uploadBooksScene
];
const stage = new Stage(scenes);

function isAdmin(ctx, next) {
  if (ctx.session.user.role === "Admin") return next();
  ctx.reply("Вам недоступна эта команда");
}

function startSceneHandler(bot) {
  bot.use(stage.middleware());

  bot.start(ctx => ctx.scene.enter("menuScene"));
  bot.command("about", (ctx) => ctx.reply(`Library Bot ${version}`));

  bot.action("menu", ctx => ctx.scene.enter("menuScene"));
  bot.action("search", ctx => ctx.scene.enter("searchBookScene"));
  bot.action("return", ctx => ctx.scene.enter("returnBookScene"));
  bot.action("available", ctx => ctx.scene.enter("availableBooksScene"));
  bot.action("unavailable", ctx => ctx.scene.enter("unavailableBooksScene"));
  bot.action("users", isAdmin, ctx => ctx.scene.enter("usersScene"));
  bot.action("add", isAdmin, ctx => ctx.scene.enter("addBookScene"));
  bot.action("upload", isAdmin, ctx => ctx.scene.enter("uploadBooksScene"));

  bot.action("back", ctx => ctx.scene.reenter());
  bot.action(/changePage (.+)/, paginator.changePageAction);
}

module.exports = { startSceneHandler };
