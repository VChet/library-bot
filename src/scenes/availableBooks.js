const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { declOfNum } = require("../helpers");
const { Book } = require("../../models/book");

const availableBooksScene = new Scene("availableBooksScene");

availableBooksScene.enter(ctx => {
  ctx.scene.session.availableBooks = {
    page: 1,
    results: {}
  };

  Book.find({ user: null, is_archived: false }).lean().exec((error, books) => {
    if (error) console.log(error);

    ctx.scene.session.availableBooks.results = books;
    if (books.length) {
      ctx.editMessageText(`В библиотеке ${books.length} ${declOfNum(books.length, ["книга", "книги", "книг"])}`,
        booksKeyboard(ctx, books)
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
  const bookData = ctx.scene.session.availableBooks.results.find(book => book._id.toString() === bookId.toString());
  ctx.scene.session.availableBooks.selected = bookData;
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
    ctx.scene.session.availableBooks.selected._id,
    { $set: { user: ctx.session.user._id } },
    { new: true },
    (error, book) => {
      if (error) console.log(error);

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

availableBooksScene.action(/changePage (.+)/, ctx => {
  ctx.match[1] === "next" ?
    ctx.scene.session.availableBooks.page++ :
    ctx.scene.session.availableBooks.page--;

  const books = ctx.scene.session.availableBooks.results;
  const currentPage = ctx.scene.session.availableBooks.page;
  const firstBooksBorder = 1 + (currentPage - 1) * 10;
  const secondBooksBorder = currentPage * 10 > books.length ? books.length : currentPage * 10;

  const newMessage = `В библиотеке ${books.length} ${declOfNum(books.length, ["книга", "книги", "книг"])} (показаны с ${firstBooksBorder} по ${secondBooksBorder})`;

  return ctx.editMessageText(newMessage, booksKeyboard(ctx, books));
});

function booksKeyboard(ctx, books) {
  const currentPage = ctx.scene.session.availableBooks.page;

  return Extra.HTML().markup(m => {
    const keyboard = [];

    if (books.length <= 10) {
      keyboard.push(...books.map(book => [
        m.callbackButton(`${book.author} — ${book.name} ${book.user ? "❌" : ""}`, `get ${book._id}`)
      ]));
    } else if (books.length > 10) {
      keyboard.push(
        ...books.slice((currentPage - 1) * 10, currentPage * 10).map(book => [
          m.callbackButton(`${book.author} — ${book.name} ${book.user ? "❌" : ""}`, `get ${book._id}`)
        ])
      );

      if (currentPage === 1) {
        keyboard.push([m.callbackButton("Вперед", "changePage next")]);
      } else if (currentPage > 1 && currentPage * 10 < books.length) {
        keyboard.push([
          m.callbackButton("Назад", "changePage previous"),
          m.callbackButton("Вперед", "changePage next")
        ]);
      } else if (currentPage * 10 > books.length) {
        keyboard.push([
          m.callbackButton("Назад", "changePage previous")
        ]);
      }
    }

    return m.inlineKeyboard(keyboard);
  });
}

module.exports = {
  availableBooksScene
};
