const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { declOfNum } = require("../helpers");
const { Book } = require("../../models/book");

const unavailableBooksScene = new Scene("unavailableBooksScene");

unavailableBooksScene.enter(ctx => {
  ctx.scene.session.unavailableBooks = {
    results: {}
  };

  Book.find({ user: { $ne: null }, is_archived: false }).populate("user").lean().exec((error, books) => {
    if (error) console.log(error);

    ctx.scene.session.unavailableBooks = books;
    const booksList = books.map(book => `${book.author} — ${book.name} (@${book.user.username})`).join("\n");
    const response = books.length ?
      `Сейчас на руках ${books.length} ${declOfNum(books.length, ["книга", "книги", "книг"])}:\n${booksList}` :
      "Все книги в библиотеке!";

    ctx.editMessageText(
      response,
      Extra.HTML().markup(m => {
        return m.inlineKeyboard([m.callbackButton("В меню", "menu")]);
      })
    );
  });
});

unavailableBooksScene.action("menu", ctx => {
  ctx.scene.leave();
  return ctx.scene.enter("menuScene");
});

module.exports = {
  unavailableBooksScene
};
