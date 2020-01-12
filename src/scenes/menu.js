const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const menuScene = new Scene("menuScene");

function isAdmin(ctx, next) {
  if (ctx.session.user.role === "Admin") return next();
  ctx.reply("Вам недоступна эта команда");
}

menuScene.enter(ctx => {
  const hide = ctx.session.user.role !== "Admin";
  ctx.deleteMessage();
  ctx.reply(
    "Выберите действие:",
    Extra.HTML().markup(m => {
      const buttons = [
        [
          m.callbackButton("Поиск", "/search"),
          m.callbackButton("Вернуть книгу", "/return")
        ], [
          m.callbackButton("Доступные книги", "/available"),
          m.callbackButton("Недоступные книги", "/unavailable")
        ],
        [
          m.callbackButton("⚠️ Пользователи", "/users", hide),
          m.callbackButton("⚠️ Добавить книгу", "/add", hide)
        ],
        [
          m.callbackButton("⚠️ Загрузить книги файлом", "/upload", hide)
        ]
      ];
      return m.inlineKeyboard(buttons);
    })
  );
});

menuScene.action("/search", ctx => {
  ctx.scene.enter("searchBookScene");
});

menuScene.action("/return", ctx => {
  ctx.scene.enter("returnBookScene");
});

menuScene.action("/available", ctx => {
  ctx.scene.enter("availableBooksScene");
});

menuScene.action("/unavailable", ctx => {
  ctx.scene.enter("unavailableBooksScene");
});

menuScene.action("/users", isAdmin, ctx => {
  ctx.scene.enter("usersScene");
});

menuScene.action("/add", isAdmin, ctx => {
  ctx.scene.enter("addBookScene");
});

menuScene.action("/upload", isAdmin, ctx => {
  ctx.scene.enter("uploadBooksScene");
});

module.exports = {
  menuScene
};
