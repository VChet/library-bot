const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { Book } = require("../db/Book");
const { replyWithError } = require("../components/error");
const { paginator } = require("../components/paginator");
const { declOfNum } = require("../helpers");

const availableBooksScene = new Scene("availableBooksScene");

availableBooksScene.enter(ctx => {
  ctx.scene.session = {
    results: {}
  };

  Book.getAvailable()
    .then(books => {
      ctx.scene.session.results = books;
      if (books.length) {
        return ctx.editMessageText(
          `В библиотеке ${books.length} ${declOfNum(books.length, ["книга", "книги", "книг"])}`,
          paginator.keyboard(ctx, books)
        );
      }

      ctx.editMessageText(
        "В библиотеке не осталось книг",
        Extra.HTML().markup(m =>
          m.inlineKeyboard([m.callbackButton("В меню", "menu")])
        )
      );
    })
    .catch(error => replyWithError(ctx, error));
});

availableBooksScene.action(/get (.+)/, (ctx) => {
  const bookId = ctx.match[1];
  const bookData = ctx.scene.session.results.find(book => book._id.toString() === bookId.toString());
  ctx.scene.session.selected = bookData;
  return ctx.editMessageText(
    `Выбранная книга: ${bookData.author} — ${bookData.name}.`,
    Extra.HTML().markup(m =>
      m.inlineKeyboard([
        [
          m.callbackButton("Взять", "take")
        ], [
          m.callbackButton("Назад к списку", "back"),
          m.callbackButton("В меню", "menu")
        ]
      ])
    )
  );
});

availableBooksScene.action("take", ctx => {
  Book.changeUser(ctx.scene.session.selected._id, ctx.session.user._id)
    .then(book => {
      ctx.editMessageText(
        "Теперь книга закреплена за вами!",
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            m.callbackButton("Назад к списку", "back"),
            m.callbackButton("В меню", "menu")
          ])
        )
      );
    })
    .catch(error => replyWithError(ctx, error));
});

availableBooksScene.action("back", ctx => {
  ctx.scene.reenter();
});

availableBooksScene.action("menu", ctx => {
  ctx.scene.leave();
  return ctx.scene.enter("menuScene");
});

availableBooksScene.action(/changePage (.+)/, paginator.changePageAction);

module.exports = {
  availableBooksScene
};
