const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { declOfNum } = require("../helpers");
const { Book } = require("../../models/book");
const { User } = require("../../models/user");

const searchBookScene = new Scene("searchBookScene");

searchBookScene.enter(ctx => {
  ctx.editMessageText(
    "Введите название книги и автора.",
    Extra.HTML().markup(m =>
      m.inlineKeyboard([m.callbackButton("Отменить поиск", "menu")])
    )
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
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            m.callbackButton("Искать ещё", "findAgain"),
            m.callbackButton("В меню", "menu")
          ])
        )
      );
    }
  });
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
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            m.callbackButton("Искать ещё", "findAgain"),
            m.callbackButton("В меню", "menu")
          ])
        )
      );
    });
  } else {
    return ctx.editMessageText(
      `Выбранная книга: ${bookData.author} — ${bookData.name}.`,
      Extra.HTML().markup(m =>
        m.inlineKeyboard([
          [
            m.callbackButton("Забрать книгу", "confirm")
            // TODO: add 'edit book' button and action
          ], [
            m.callbackButton("Искать ещё", "findAgain"),
            m.callbackButton("В меню", "menu")
          ]
        ])
      )
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

      ctx.editMessageText(
        `Теперь книга "${book.name}" закреплена за вами!`,
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            m.callbackButton("Искать ещё", "findAgain"),
            m.callbackButton("В меню", "menu")
          ])
        )
      );
    }
  );
});

searchBookScene.action("findAgain", ctx => {
  ctx.scene.reenter();
});

searchBookScene.action("menu", ctx => {
  ctx.scene.leave();
  return ctx.scene.enter("menuScene");
});

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
