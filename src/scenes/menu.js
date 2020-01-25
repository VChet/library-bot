const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const menuScene = new Scene("menuScene");

menuScene.enter(ctx => {
  const hide = ctx.session.user.role !== "Admin";

  const keyboard = Extra.HTML().markup(m => {
    const buttons = [
      [
        m.callbackButton("Поиск", "search"),
        m.callbackButton("Вернуть книгу", "return")
      ], [
        m.callbackButton("Доступные книги", "available"),
        m.callbackButton("Недоступные книги", "unavailable")
      ],
      [
        m.callbackButton("⚠️ Пользователи", "users", hide),
        m.callbackButton("⚠️ Добавить книгу", "add", hide)
      ],
      [
        m.callbackButton("⚠️ Загрузить книги файлом", "upload", hide)
      ]
    ];
    return m.inlineKeyboard(buttons);
  });

  if (ctx.updateType === "message") {
    ctx.reply("Выберите действие:", keyboard);
  } else {
    ctx.editMessageText("Выберите действие:", keyboard);
  }
});

module.exports = {
  menuScene
};
