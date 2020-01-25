const Stage = require("telegraf/stage");

const { version } = require("../package.json");

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

function startSceneHandler(bot) {
  bot.use(stage.middleware());

  bot.start(ctx => ctx.scene.enter("menuScene"));

  bot.command("about", (ctx) => ctx.reply(`Library Bot ${version}`));

  });
}

module.exports = { startSceneHandler };
