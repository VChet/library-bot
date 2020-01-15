const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { Book } = require("../db/Book");
const { replyWithError } = require("../components/error");

const editBookScene = new Scene("editBookScene");

editBookScene.enter(ctx => {
  if (!ctx.session.selectedBook) {
    ctx.editMessageText(
      "Что-то пошло не так. Книга не была выбрана",
      Extra.HTML().markup(m =>
        m.inlineKeyboard([m.callbackButton("В меню", "menu")])
      )
    );
  }
  ctx.scene.session.bookData = ctx.session.selectedBook;

  const bookData = ctx.scene.session.bookData;
  let response = "Введите данные о книге в формате \nАвтор\nНазвание\nКатегория\n\n";
  response += `Текущая книга: \nАвтор: ${bookData.author}\nНазвание: ${bookData.name}\nКатегория: ${bookData.category}`;

  ctx.editMessageText(
    response,
    Extra.HTML().markup(m =>
      m.inlineKeyboard([m.callbackButton("Отмена", "menu")])
    )
  );
});

editBookScene.on("message", ctx => {
  const arr = ctx.message.text.split("\n");
  if (arr.length !== 3) {
    ctx.reply(
      "Что-то не так, попробуйте снова",
      Extra.HTML().markup(m =>
        m.inlineKeyboard([m.callbackButton("В меню", "menu")])
      )
    );
  }

  ctx.scene.session.bookData.author = arr[0];
  ctx.scene.session.bookData.name = arr[1];
  ctx.scene.session.bookData.category = arr[2];
  const bookData = ctx.scene.session.bookData;

  ctx.reply(
    `Все верно?\nАвтор: ${bookData.author}\nНазвание: ${bookData.name}\nКатегория: ${bookData.category}`,
    Extra.HTML().markup(m =>
      m.inlineKeyboard([
        m.callbackButton("Да", "edit"),
        m.callbackButton("Нет", "back"),
      ])
    )
  );
});

editBookScene.action("edit", ctx => {
  const bookData = ctx.scene.session.bookData;
  Book.changeData(bookData)
    .then(book => {
      ctx.editMessageText(
        `Книга "${book.name}" обновлена`,
        Extra.HTML().markup(m =>
          m.inlineKeyboard([m.callbackButton("В меню", "menu")])
        )
      );
    })
    .catch(error => replyWithError(ctx, error));
});

editBookScene.action("menu", ctx => {
  ctx.scene.leave();
  return ctx.scene.enter("menuScene");
});

editBookScene.action("back", ctx => {
  ctx.scene.reenter();
});

module.exports = {
  editBookScene
};
