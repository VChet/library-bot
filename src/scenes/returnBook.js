const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { declOfNum } = require("../helpers");
const { Book } = require("../../models/book");

const returnBookScene = new Scene("returnBookScene");

returnBookScene.enter(ctx => {
  ctx.scene.session.returnBook = {
    selected: {}
  };

  Book.find({ user: ctx.session.user._id }).lean().exec((error, books) => {
    if (error) console.log(error);

    if (books.length) {
      ctx.session.user.books = books;
      ctx.editMessageText(
        `У вас ${books.length} ${declOfNum(books.length, ["книга", "книги", "книг"])}. Выберите книгу, которую хотите вернуть:`,
        booksKeyboard(books)
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
  const bookData = ctx.session.user.books.find(book => book._id.toString() === bookId.toString());
  ctx.scene.session.returnBook.selected = bookData;
  return ctx.editMessageText(
    `Вернуть "${bookData.author} — ${bookData.name}"?`,
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
    ctx.scene.session.returnBook.selected._id,
    { $set: { user: null } },
    { new: true },
    (error, book) => {
      if (error) console.log(error);

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

function booksKeyboard(books) {
  return Extra.HTML().markup(m =>
    m.inlineKeyboard(
      books.map(book => [
        m.callbackButton(`${book.author} — ${book.name}`, `get ${book._id}`)
      ])
    )
  );
}

module.exports = {
  returnBookScene
};
