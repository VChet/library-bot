const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { declOfNum } = require("../helpers");
const { Book } = require("../../models/book");
const { User } = require("../../models/user");

const searchBookScene = new Scene("searchBookScene");

searchBookScene.enter(ctx => {
  ctx.editMessageText(
    "Введите название книги и автора.",
    keyboard([
      { key: "cancel", value: "Отменить поиск" }
    ])
  );
});

searchBookScene.on("message", ctx => {
  ctx.scene.session.searchBook = {
    query: "",
    results: [],
    selected: {}
  };

  ctx.scene.session.searchBook.query = ctx.message.text;

  Book.find({ $text: { $search: ctx.message.text }, is_archived: false }).lean().exec((error, books) => {
    if (error) return console.log(error);
    if (books.length) {
      if (books.length > 100) {
        ctx.scene.session.searchBook.results = books.slice(0, 99);
      } else {
        ctx.scene.session.searchBook.results = books;
      }

      ctx.reply(
        `Найдено ${books.length} ${declOfNum(books.length, ["книга", "книги", "книг"])}:`,
        booksKeyboard(books)
      );
    } else {
      ctx.reply(
        "Ничего не найдено",
        keyboard([
          { key: "findAgain", value: "Искать ещё" },
          { key: "cancel", value: "Отмена" }
        ])
      );
    }
  });
});

searchBookScene.action("cancel", (ctx) => {
  ctx.editMessageText("Поиск отменен");
  return ctx.scene.leave();
});

searchBookScene.action(/get (.+)/, (ctx) => {
  const bookId = ctx.match[1];
  const bookData = ctx.scene.session.searchBook.results.find(book => book._id.toString() === bookId.toString());
  ctx.scene.session.searchBook.selected = bookData;
  if (bookData.user) {
    User.findById(bookData.user).lean().exec((error, user) => {
      if (error) console.log(error);

      return ctx.editMessageText(
        `${bookData.name} сейчас у @${user.username}`,
        // TODO: add action for 'back'
        keyboard([{ key: "back", value: "Назад" }])
      );
    });
  } else {
    return ctx.editMessageText(
      `Выбранная книга: ${bookData.author} — ${bookData.name}.`,
      keyboard([
        { key: "confirm", value: "Подтвердить выбор" },
        // TODO: add action for 'back'
        { key: "back", value: "Назад" }
      ])
    );
  }
});

searchBookScene.action("confirm", ctx => {
  Book.findByIdAndUpdate(
    ctx.scene.session.searchBook.selected._id,
    { $set: { user: ctx.session.user._id } },
    { new: true },
    (error, book) => {
      if (error) console.log(error);

      ctx.editMessageText(`Теперь книга "${book.name}" закреплена за вами!`);
      return ctx.scene.leave();
    }
  );
});

searchBookScene.action("findAgain", ctx => {
  ctx.scene.leave();
  return ctx.scene.enter("searchBookScene");
});

function keyboard(items) {
  return Extra.HTML().markup(m =>
    m.inlineKeyboard(
      items.map(item => [
        m.callbackButton(item.value, item.key)
      ])
    )
  );
}

function booksKeyboard(books) {
  return Extra.HTML().markup(m =>
    m.inlineKeyboard(
      books.map(book => [
        m.callbackButton(`${book.author} — ${book.name} ${book.user ? "❌" : ""}`, `get ${book._id}`)
      ])
    )
  );
}

module.exports = {
  searchBookScene
};
