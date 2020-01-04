const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { declOfNum } = require("../helpers");
const { Book } = require("../../models/book");
const { User } = require("../../models/user");

const searchBookScene = new Scene("searchBookScene");

searchBookScene.enter(ctx => {
  ctx.reply(
    "Введите название книги и автора.",
    keyboard([
      { key: "cancel", value: "Отменить поиск" }
    ])
  );
});

searchBookScene.on("message", ctx => {
  ctx.scene.session.searchBook = {
    book: "",
    foundBooks: [],
    selected: {}
  };

  ctx.scene.session.searchBook.book = ctx.message.text;

  Book.find({ $text: { $search: ctx.message.text } }).lean().exec((error, books) => {
    if (error) return console.log(error);
    if (books.length) {
      if (books.length > 100) {
        ctx.scene.session.searchBook.foundBooks = books.slice(0, 99);
      } else {
        ctx.scene.session.searchBook.foundBooks = books;
      }

      const foundBooks = ctx.scene.session.searchBook.foundBooks.length;
      ctx.reply(
        `Найдено ${foundBooks} ${declOfNum(foundBooks, ["книга", "книги", "книг"])}:`,
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

searchBookScene.hears("Отменить поиск", ctx => {
  ctx.reply("Поиск отменен");
  return ctx.scene.leave();
});

searchBookScene.action("cancel", (ctx) => {
  ctx.reply("Поиск отменен");
  return ctx.scene.leave();
});

searchBookScene.action(/get.+/, (ctx) => {
  const selectedBook = ctx.match[0].split(" ")[1];
  const filterBySelectedBook = ctx.scene.session.searchBook.foundBooks.filter(book => book._id.toString() === selectedBook.toString());
  ctx.scene.session.searchBook.selected = filterBySelectedBook[0];
  if (ctx.scene.session.searchBook.selected.user) {
    User.findById(ctx.scene.session.searchBook.selected.user).lean().exec((error, user) => {
      if (error) console.log(error);

      return ctx.reply(
        `${filterBySelectedBook[0].name} сейчас у @${user.username}`,
        keyboard([
          { key: "back", value: "Назад" }
        ])
      );
    });
  } else {
    return ctx.reply(
      `Выбранная книга: ${filterBySelectedBook[0].author} — ${filterBySelectedBook[0].name}.`,
      keyboard([
        { key: "confirm", value: "Подтвердить выбор" },
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

      ctx.reply("Теперь книга находится у вас! Вы можете проверить список взятых книг командой /books list");
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
        m.callbackButton(`${book.author} — ${book.name} ${book.user ? '❌' : ''}`, `get ${book._id}`)
      ])
    )
  );
}

module.exports = {
  searchBookScene
};
