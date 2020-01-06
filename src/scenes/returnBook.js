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
      ctx.reply(
        `У вас ${books.length} ${declOfNum(books.length, ["книга", "книги", "книг"])}. Выберите книгу, которую хотите вернуть:`,
        booksKeyboard(books)
      );
    } else {
      ctx.reply("У вас нет невозвращенных книг");
      return ctx.scene.leave();
    }
  });
});

returnBookScene.action(/get (.+)/, (ctx) => {
  const bookId = ctx.match[1];
  const bookData = ctx.session.user.books.find(book => book._id.toString() === bookId.toString());
  ctx.scene.session.returnBook.selected = bookData;
  return ctx.reply(
    `Вернуть ${bookData.author} — ${bookData.name}?`,
    keyboard([
      { key: "confirm", value: "Да" },
      { key: "back", value: "Назад" }
    ])
  );
});

returnBookScene.action("confirm", ctx => {
  Book.findByIdAndUpdate(
    ctx.scene.session.returnBook.selected._id,
    { $set: { user: null } },
    { new: true },
    (error, book) => {
      if (error) console.log(error);

      ctx.reply("Вы вернули книгу. Спасибо!");
      return ctx.scene.leave();
    }
  );
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
  returnBookScene
};
