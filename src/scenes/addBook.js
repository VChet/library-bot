const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { Book } = require("../../models/book");

const addBookScene = new Scene("addBookScene");

addBookScene.enter(ctx => {
  ctx.editMessageText(
    "Введите данные о книге в формате \nАвтор\nНазвание\nКатегория",
    Extra.HTML().markup(m =>
      m.inlineKeyboard([m.callbackButton("Отмена", "menu")])
    )
  );
});

addBookScene.on("message", ctx => {
  ctx.scene.session.addBook = {
    bookData: {}
  };

  const arr = ctx.message.text.split("\n");
  if (arr.length !== 3) {
    return ctx.reply(
      "Что-то не так, попробуйте снова",
      Extra.HTML().markup(m =>
        m.inlineKeyboard([m.callbackButton("Отмена", "menu")])
      )
    );
  }
  const bookData = {
    author: arr[0],
    name: arr[1],
    category: arr[2]
  };

  ctx.scene.session.addBook.bookData = bookData;

  Book.findOne({ author: bookData.author, name: bookData.name }).lean().exec((error, book) => {
    if (error) console.log(error);

    if (book) {
      return ctx.reply(
        `В библиотеке уже есть книга автора "${book.author}" с названием "${book.name}"\nЕсли это еще один экземпляр - укажите это в названии`,
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            m.callbackButton("Попробовать снова", "back"),
            m.callbackButton("В меню", "menu"),
          ])
        )
      );
    }

    ctx.reply(
      `Все верно?\nАвтор: ${bookData.author}\nНазвание: ${bookData.name}\nКатегория: ${bookData.category}`,
      Extra.HTML().markup(m =>
        m.inlineKeyboard([
          m.callbackButton("Да", "add"),
          m.callbackButton("Нет", "back"),
        ])
      )
    );
  });
});

addBookScene.action("add", ctx => {
  const bookData = ctx.scene.session.addBook.bookData;
  Book.create(bookData, (error, book) => {
    if (error) console.log(error);

    ctx.editMessageText(
      "Книга добавлена!",
      Extra.HTML().markup(m =>
        m.inlineKeyboard([
          m.callbackButton("Добавить ещё", "back"),
          m.callbackButton("В меню", "menu"),
        ])
      )
    );
  });
});

addBookScene.action("menu", ctx => {
  ctx.scene.leave();
  return ctx.scene.enter("menuScene");
});

addBookScene.action("back", ctx => {
  ctx.scene.reenter();
});

module.exports = {
  addBookScene
};
