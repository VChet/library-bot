const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { Book } = require("../db/Book");
const { Category } = require("../db/Category");
const { replyWithError } = require("../components/error");
const { paginator } = require("../components/paginator");
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
          paginator.keyboard(ctx, books)
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

returnBookScene.action(/get (.+)/, async (ctx) => {
  const bookId = ctx.match[1];
  const bookData = ctx.scene.session.userBooks.find(book => book._id.toString() === bookId.toString());
  ctx.scene.session.selected = bookData;

  const category = await Category.getById(bookData.category);
  const response = `Вернуть "${bookData.author} — ${bookData.name}"?\nРаздел "${category.name}"`;
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
  const bookId = ctx.scene.session.selected._id;
  Book.clearUser(bookId)
    .then(book => {
      ctx.editMessageText(
        `Вы вернули книгу "${book.name}". Спасибо!`,
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

module.exports = {
  returnBookScene
};
