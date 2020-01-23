const { Extra } = require("telegraf");

const replyWithError = (ctx, error) => {
  console.log("ERROR:", error);
  return ctx.reply(
    `Ошибка! ${error}`,
    Extra.HTML().markup(m =>
      m.inlineKeyboard([m.callbackButton("В меню", "menu")])
    )
  );
};

module.exports = { replyWithError };
