const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { Book } = require("../db/Book");
const { replyWithError } = require("../components/error");
const { paginator } = require("../components/paginator");
const { declOfNum, hideButton } = require("../helpers");

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
  const user = bookData.user ?
    `@${bookData.user.username}` :
    bookData.taken_by;

  ctx.scene.session.selected = bookData;
  return ctx.editMessageText(
    `${bookData.name_author}. Сейчас у ${user}`,
    Extra.HTML().markup(m =>
      m.inlineKeyboard([
        [
          m.callbackButton("Назад к списку", "back"),
          m.callbackButton("В меню", "menu")
        ], [
          m.callbackButton("⚠️ Книга была возвращена", "returnTaken", hideButton(ctx) && bookData.taken_by)
        ]
      ])
    )
  );
});

module.exports = {
  unavailableBooksScene
};
