const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { Book } = require("../db/Book");
const { Category } = require("../db/Category");
const { replyWithError } = require("../components/error");

const addBookScene = new Scene("addBookScene");

addBookScene.enter(ctx => {
  ctx.editMessageText(
    "Введите данные о книге в формате \nАвтор\nНазвание\nРаздел",
    Extra.HTML().markup(m =>
      m.inlineKeyboard([m.callbackButton("Отмена", "menu")])
    )
  );
});

addBookScene.on("message", async (ctx) => {
  ctx.scene.session.bookData = {};

  const arr = ctx.message.text.split("\n");
  if (arr.length !== 3) {
    return ctx.reply(
      "Что-то не так. Попробуйте снова",
      Extra.HTML().markup(m =>
        m.inlineKeyboard([m.callbackButton("Отмена", "menu")])
      )
    );
  }

  const category = await Category.getByName(arr[2]);
  if (!category) {
    return ctx.reply(
      `Раздела "${arr[2]}" нет. Попробуйте снова`,
      Extra.HTML().markup(m =>
        m.inlineKeyboard([m.callbackButton("Отмена", "menu")])
      )
    );
  }

  const bookData = {
    author: arr[0],
    name: arr[1],
    category
  };
  ctx.scene.session.bookData = bookData;

  Book.isExists(bookData.author, bookData.name)
    .then(book => {
      if (book) {
        let response = `В библиотеке уже есть книга автора "${book.author}" с названием "${book.name}"`;
        response += "\nЕсли это еще один экземпляр - укажите это в названии";
        return ctx.reply(
          response,
          Extra.HTML().markup(m =>
            m.inlineKeyboard([
              m.callbackButton("Попробовать снова", "back"),
              m.callbackButton("В меню", "menu"),
            ])
          )
        );
      }

      ctx.reply(
        `Все верно?\nАвтор: ${bookData.author}\nНазвание: ${bookData.name}\nРаздел: ${bookData.category.name}`,
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
  Book.addOne(ctx.scene.session.bookData)
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

module.exports = {
  addBookScene
};
