const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { Book } = require("../db/Book");
const { replyWithError } = require("../components/error");
const { paginator } = require("../components/paginator");
const { book } = require("../components/book");
const { declOfNum, hideButton } = require("../helpers");

const searchBookScene = new Scene("searchBookScene");

searchBookScene.enter(ctx => {
  ctx.editMessageText(
    "Введите название книги или автора",
    Extra.HTML().markup(m =>
      m.inlineKeyboard([m.callbackButton("Отменить поиск", "menu")])
    )
  );
});

searchBookScene.on("message", ctx => {
  ctx.scene.session = {
    query: ctx.message.text,
    results: [],
    selected: {}
  };

  Book.getByQuery(ctx.message.text)
    .then(books => {
      if (books.length) {
        ctx.scene.session.results = books;
        return ctx.reply(
          `Найдено ${books.length} ${declOfNum(books.length, ["книга", "книги", "книг"])}:`,
          paginator.keyboard(ctx, books)
        );
      }
      ctx.reply(
        "Ничего не найдено",
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            m.callbackButton("Искать ещё", "back"),
            m.callbackButton("В меню", "menu")
          ])
        )
      );
    })
    .catch(error => replyWithError(ctx, error));
});

searchBookScene.action(/get (.+)/, (ctx) => {
  const bookId = ctx.match[1];
  const bookData = ctx.scene.session.results.find(book => book._id.toString() === bookId.toString());
  ctx.scene.session.selected = bookData;
  if (bookData.user || bookData.taken_by) {
    if (bookData.user && bookData.user.toString() === ctx.session.user._id.toString()) {
      const response = `Вернуть "${bookData.name_author}"?\nРаздел "${bookData.category.name}"`;
      return ctx.editMessageText(
        response,
        book.keyboard(ctx, { text: "Вернуть книгу", action: "return" })
      );
    }

    const user = bookData.user ?
      `@${bookData.user.username}` :
      bookData.taken_by;

    return ctx.editMessageText(
      `${bookData.name_author} сейчас у ${user}`,
      Extra.HTML().markup(m =>
        m.inlineKeyboard([
          [
            m.callbackButton("Искать ещё", "back"),
            m.callbackButton("В меню", "menu")
          ], [
            m.callbackButton("⚠️ Книга была возвращена", "returnTaken", hideButton(ctx) && bookData.taken_by)
          ]
        ])
      )
    );
  } else {
    ctx.editMessageText(
      `Выбранная книга: ${bookData.name_author}.\nРаздел "${bookData.category.name}"`,
      book.keyboard(ctx, { text: "Взять книгу", action: "take" })
    );
  }
});

module.exports = {
  searchBookScene
};
