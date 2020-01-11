const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { Book } = require("../../models/book");
const { replyWithError } = require("../components/error");
const { bookPaginator } = require("../components/bookPaginator");
const { declOfNum } = require("../helpers");

const returnBookScene = new Scene("returnBookScene");

returnBookScene.enter(ctx => {
  ctx.scene.session = {
    userBooks: [],
    selected: {}
  };

  Book.find({ user: ctx.session.user._id }).lean().exec((error, books) => {
    if (error) replyWithError(ctx, error);

    if (books.length) {
      ctx.scene.session.userBooks = books;
      ctx.editMessageText(
        `У вас ${books.length} ${declOfNum(books.length, ["книга", "книги", "книг"])}. Выберите книгу, которую хотите вернуть:`,
        bookPaginator.keyboard(books)
      );
    } else {
      ctx.editMessageText(
        "У вас нет невозвращенных книг",
        Extra.HTML().markup(m =>
          m.inlineKeyboard([m.callbackButton("В меню", "menu")])
        )
      );
    }
  });
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
  Book.findByIdAndUpdate(
    ctx.scene.session.selected._id,
    { $set: { user: null } },
    { new: true },
    (error, book) => {
      if (error) replyWithError(ctx, error);

      ctx.editMessageText(
        `Вы вернули книгу "${book.author} — ${book.name}". Спасибо!`,
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            m.callbackButton("Назад к списку", "back"),
            m.callbackButton("В меню", "menu")
          ])
        )
      );
    }
  );
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
