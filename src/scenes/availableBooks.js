const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { Book } = require("../../models/book");
const { replyWithError } = require("../components/error");
const { bookPaginator } = require("../components/bookPaginator");
const { declOfNum } = require("../helpers");

const availableBooksScene = new Scene("availableBooksScene");

availableBooksScene.enter(ctx => {
  ctx.scene.session = {
    results: {}
  };

  Book.find({ user: null, is_archived: false }).lean().exec((error, books) => {
    if (error) replyWithError(ctx, error);

    ctx.scene.session.results = books;
    if (books.length) {
      ctx.editMessageText(
        `В библиотеке ${books.length} ${declOfNum(books.length, ["книга", "книги", "книг"])}`,
        bookPaginator.keyboard(books)
      );
    } else {
      ctx.editMessageText(
        "В библиотеке не осталось книг",
        Extra.HTML().markup(m =>
          m.inlineKeyboard([m.callbackButton("В меню", "menu")])
        )
      );
    }
  });
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
  Book.findByIdAndUpdate(
    ctx.scene.session.selected._id,
    { $set: { user: ctx.session.user._id } },
    { new: true },
    (error, book) => {
      if (error) replyWithError(ctx, error);

      ctx.editMessageText(
        "Теперь книга закреплена за вами!",
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

availableBooksScene.action("back", ctx => {
  ctx.scene.reenter();
});

availableBooksScene.action("menu", ctx => {
  ctx.scene.leave();
  return ctx.scene.enter("menuScene");
});

availableBooksScene.action(/changePage (.+)/, bookPaginator.changePageAction);

module.exports = {
  availableBooksScene
};
