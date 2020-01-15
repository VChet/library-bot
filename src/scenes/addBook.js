const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { Book } = require("../db/Book");
const { replyWithError } = require("../components/error");

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
  ctx.scene.session.bookData = {};

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

  ctx.scene.session.bookData = bookData;

  Book.isExists(bookData.author, bookData.name)
    .then(book => {
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
            m.callbackButton("Да, добавить", "add"),
            m.callbackButton("Нет, ввести снова", "back"),
          ])
        )
      );
    })
    .catch(error => replyWithError(ctx, error));
});

addBookScene.action("add", ctx => {
  const bookData = ctx.scene.session.bookData;
  Book.addOne(bookData)
    .then(book => {
      ctx.editMessageText(
        `Книга "${book.name}" добавлена!`,
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            m.callbackButton("Добавить ещё", "back"),
            m.callbackButton("В меню", "menu"),
          ])
        )
      );
    })
    .catch(error => replyWithError(ctx, error));
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
