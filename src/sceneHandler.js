const Stage = require("telegraf/stage");
const { Extra } = require("telegraf");

const bot = require("../index");
const { version, author, repository } = require("../package.json");
const { paginator } = require("./components/paginator");
const { book } = require("./components/book");

// Scenes
const { menuScene } = require("./scenes/menu");
const { searchBookScene } = require("./scenes/searchBook");
const { returnBookScene } = require("./scenes/returnBook");
const { availableBooksScene } = require("./scenes/availableBooks");
const { unavailableBooksScene } = require("./scenes/unavailableBooks");
const { usersScene } = require("./scenes/users");
const { categoriesScene } = require("./scenes/categories");
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
  categoriesScene,
  addBookScene,
  editBookScene,
  uploadBooksScene
];
const stage = new Stage(scenes);

function isAdmin(ctx, next) {
  if (ctx.session.user.role === "Admin") return next();
  ctx.reply("Вам недоступна эта команда");
}

function aboutMeesage(ctx) {
  ctx.reply(
    `Library Bot ${version}. Автор @${author}`,
    Extra.HTML().markup(m => m.inlineKeyboard(
      [m.urlButton("Репозиторий", repository.url)]
    ))
  );
}

bot.use(stage.middleware());

bot.start(ctx => ctx.scene.enter("menuScene"));
bot.command("about", aboutMeesage);

bot.action("menu", ctx => ctx.scene.enter("menuScene"));
bot.action("search", ctx => ctx.scene.enter("searchBookScene"));
bot.action("taken", ctx => ctx.scene.enter("returnBookScene"));
bot.action("available", ctx => ctx.scene.enter("availableBooksScene"));
bot.action("unavailable", ctx => ctx.scene.enter("unavailableBooksScene"));
bot.action("categories", isAdmin, ctx => ctx.scene.enter("categoriesScene"));
bot.action("users", isAdmin, ctx => ctx.scene.enter("usersScene"));
bot.action("add", isAdmin, ctx => ctx.scene.enter("addBookScene"));
bot.action("upload", isAdmin, ctx => ctx.scene.enter("uploadBooksScene"));

// Paginator
bot.action("back", ctx => (ctx.scene.session.current ? ctx.scene.reenter() : ctx.scene.enter("menuScene")));
bot.action(/changePage (.+)/, paginator.changePageAction);
// Book
bot.action("take", book.actions.take);
bot.action("return", book.actions.return);
bot.action("returnTaken", book.actions.returnTaken);
bot.action("edit", book.actions.edit);
bot.action("archiveCheck", book.actions.archiveCheck);
bot.action("archive", book.actions.archive);
bot.action("logs", book.actions.logs);
