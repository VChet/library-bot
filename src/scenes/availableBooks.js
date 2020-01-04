const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { declOfNum } = require("../helpers");
const { Book } = require("../../models/book");

const availableBooksScene = new Scene("availableBooksScene");

availableBooksScene.enter(ctx => {
  ctx.scene.session.availableBooks = {
    results: {}
  };

  Book.find({ user: null }).lean().exec((error, books) => {
    if (error) console.log(error);

    ctx.scene.session.availableBooks = books;
    ctx.reply(`В библиотеке ${books.length} ${declOfNum(books.length, ["книга", "книги", "книг"])}`,
      booksKeyboard(books)
    );
  });
});

availableBooksScene.action(/get.+/, (ctx) => {
  const selectedBook = ctx.match[0].split(" ")[1];
  const filterBySelectedBook = ctx.scene.session.availableBooks.filter(book => book._id.toString() === selectedBook.toString());
  ctx.scene.session.availableBooks.selected = filterBySelectedBook[0];
  return ctx.reply(
    `Выбранная книга: ${filterBySelectedBook[0].author} — ${filterBySelectedBook[0].name}.`,
    keyboard([
      { key: "take", value: "Взять" },
      { key: "findAgain", value: "Назад к списку" }
    ])
  );
});

availableBooksScene.action("take", ctx => {
  Book.findByIdAndUpdate(
    ctx.scene.session.availableBooks.selected._id,
    { $set: { user: ctx.session.user._id } },
    { new: true },
    (error, book) => {
      if (error) console.log(error);

      ctx.reply("Теперь книга находится у вас! Вы можете проверить список взятых книг командой /books list");
      return ctx.scene.leave();
    }
  );
});

availableBooksScene.action("findAgain", ctx => {
  ctx.scene.leave();
  return ctx.scene.enter("availableBooksScene");
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
        m.callbackButton(`${book.author} — ${book.name}`, `get ${book._id}`)
      ])
    )
  );
}

module.exports = {
  availableBooksScene
};
