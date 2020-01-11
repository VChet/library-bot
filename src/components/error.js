const { Extra } = require("telegraf");

const replyWithError = (ctx, error) => {
  return ctx.reply(
    `Ошибка! ${error}`,
    Extra.HTML().markup(m =>
      m.inlineKeyboard([m.callbackButton("В меню", "menu")])
    )
  );
};

module.exports = { replyWithError };
