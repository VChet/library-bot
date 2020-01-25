const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { declOfNum } = require("../helpers");
const { Book } = require("../db/Book");
const { paginator } = require("../components/paginator");
const { replyWithError } = require("../components/error");

const unavailableBooksScene = new Scene("unavailableBooksScene");

unavailableBooksScene.enter(ctx => {
  ctx.scene.session.results = {};

  Book.getUnavailable()
    .then(books => {
      ctx.scene.session.results = books;

      if (!books.length) {
        return ctx.editMessageText(
          "Все книги в библиотеке!",
          Extra.HTML().markup(m => {
            return m.inlineKeyboard([m.callbackButton("В меню", "menu")]);
          })
        );
      }

      books.forEach(book => {
        book.user = book.user ? `@${book.user.username}` : book.taken_by;
      });

      ctx.editMessageText(
        `Сейчас на руках ${books.length} ${declOfNum(books.length, ["книга", "книги", "книг"])}`,
        paginator.keyboard(ctx, books)
      );
    })
    .catch(error => replyWithError(ctx, error));
});

unavailableBooksScene.action(/get (.+)/, (ctx) => {
  const bookId = ctx.match[1];
  const bookData = ctx.scene.session.results.find(book => book._id.toString() === bookId.toString());
  ctx.scene.session.selected = bookData;
  return ctx.editMessageText(
    `${bookData.author} — ${bookData.name}. Сейчас у ${bookData.user}`,
    Extra.HTML().markup(m =>
      m.inlineKeyboard([
        m.callbackButton("Назад к списку", "back"),
        m.callbackButton("В меню", "menu")
      ])
    )
  );
});

module.exports = {
  unavailableBooksScene
};
