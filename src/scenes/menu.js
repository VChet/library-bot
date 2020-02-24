const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { paginator } = require("../components/paginator");

const menuScene = new Scene("menuScene");

menuScene.enter(ctx => {
  const hide = ctx.session.user.role !== "Admin";

  const keyboard = Extra.HTML().markup(m => {
    const buttons = [
      [
        m.callbackButton("Поиск", "search"),
        m.callbackButton("Вернуть книгу", "taken")
      ], [
        m.callbackButton("Доступные книги", "available"),
        m.callbackButton("Недоступные книги", "unavailable")
      ],
      [
        m.callbackButton("⚠️ Пользователи", "users", hide),
        m.callbackButton("⚠️ Разделы", "categories", hide),
      ],
      [
        m.callbackButton("⚠️ Добавить книгу", "add", hide),
        m.callbackButton("⚠️ Загрузить из файла", "upload", hide)
      ]
    ];
    return m.inlineKeyboard(buttons);
  });

  paginator.page = 1;
  if (ctx.updateType === "message") {
    ctx.reply("Выберите действие:", keyboard);
  } else {
    ctx.editMessageText("Выберите действие:", keyboard);
  }
});

module.exports = {
  menuScene
};
