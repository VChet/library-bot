const Stage = require("telegraf/stage");

// Scenes
const { menuScene } = require("./scenes/menu");
const { searchBookScene } = require("./scenes/searchBook");
const { returnBookScene } = require("./scenes/returnBook");
const { availableBooksScene } = require("./scenes/availableBooks");
const { unavailableBooksScene } = require("./scenes/unavailableBooks");
const { usersScene } = require("./scenes/users");
const { addBookScene } = require("./scenes/addBook");
const { editBookScene } = require("./scenes/editBook");
const scenes = [
  menuScene,
  searchBookScene,
  returnBookScene,
  availableBooksScene,
  unavailableBooksScene,
  usersScene,
  addBookScene,
  editBookScene
];
const stage = new Stage(scenes);

function startSceneHandler(bot) {
  bot.use(stage.middleware());

  bot.on(["message", "callback_query"], (ctx) => {
    ctx.scene.enter("menuScene");
  });

  bot.start(ctx => {
    ctx.scene.enter("menuScene");
  });
}

module.exports = { startSceneHandler };
