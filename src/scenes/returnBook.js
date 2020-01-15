const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { Book } = require("../db/Book");
const { replyWithError } = require("../components/error");
const { bookPaginator } = require("../components/bookPaginator");
const { declOfNum } = require("../helpers");

const returnBookScene = new Scene("returnBookScene");

returnBookScene.enter(ctx => {
  ctx.scene.session = {
    userBooks: [],
    selected: {}
  };

  Book.getByUser(ctx.session.user._id)
    .then(books => {
      if (books.length) {
        ctx.scene.session.userBooks = books;
        return ctx.editMessageText(
          `У вас ${books.length} ${declOfNum(books.length, ["книга", "книги", "книг"])}. Выберите книгу, которую хотите вернуть:`,
          bookPaginator.keyboard(books)
        );
      }
      ctx.editMessageText(
        "У вас нет невозвращенных книг",
        Extra.HTML().markup(m =>
          m.inlineKeyboard([m.callbackButton("В меню", "menu")])
        )
      );
    })
    .catch(error => replyWithError(ctx, error));
});

returnBookScene.action(/get (.+)/, (ctx) => {
  const bookId = ctx.match[1];
  const bookData = ctx.scene.session.userBooks.find(book => book._id.toString() === bookId.toString());
  ctx.scene.session.selected = bookData;
  let response = `Вернуть "${bookData.author} — ${bookData.name}"?`;
  if (bookData.category) response += `\nРаздел "${bookData.category}"`;
  return ctx.editMessageText(
    response,
    Extra.HTML().markup(m =>
      m.inlineKeyboard([
        [
          m.callbackButton("Вернуть", "return")
        ], [
          m.callbackButton("Назад к списку", "back"),
          m.callbackButton("В меню", "menu")
        ]
      ])
    )
  );
});

returnBookScene.action("return", ctx => {
  Book.clearUser(ctx.scene.session.selected._id)
    .then(book => {
      ctx.editMessageText(
        `Вы вернули книгу "${book.author} — ${book.name}". Спасибо!`,
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

returnBookScene.action("back", ctx => {
  ctx.scene.reenter();
});

returnBookScene.action("menu", ctx => {
  ctx.scene.leave();
  return ctx.scene.enter("menuScene");
});

returnBookScene.action(/changePage (.+)/, bookPaginator.changePageAction);

module.exports = {
  returnBookScene
};
