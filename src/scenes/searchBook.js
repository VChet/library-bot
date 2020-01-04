const Scene = require("telegraf/scenes/base");
const { Book } = require("../../models/book");
const { Extra } = require("telegraf");

const searchBookScene = new Scene("searchBookScene");

searchBookScene.enter(ctx => {
  ctx.reply("Введите название книги и автора.", keyboard([
    {
      key: "cancel",
      value: "Отменить поиск"
    }
  ]));
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

      ctx.reply(`Найдено ${ctx.scene.session.searchBook.foundBooks.length} книг:`, booksKeyboard(books));
    } else {
      ctx.reply("Ничего не найдено", keyboard([
        {
          key: "findAgain",
          value: "Искать ещё"
        },
        {
          key: "cancel",
          value: "Отмена"
        }
      ]));
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
  return ctx.reply(`Выбранная книга: ${filterBySelectedBook[0].author} — ${filterBySelectedBook[0].name}.`, keyboard([
    {
      key: "confirm",
      value: "Подтвердить выбор",
    },
    {
      key: "back",
      value: "Назад",
    }
  ]));
});

searchBookScene.action("confirm", ctx => {
  console.log("add book in useer library");

  ctx.reply("Теперь книга находится у вас! Вы можете проверить список взятых книг командой /books list");
  return ctx.scene.leave();
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
        m.callbackButton(`${book.author} — ${book.name}`, `get ${book._id}`)
      ])
    )
  );
}

module.exports = {
  searchBookScene
};
