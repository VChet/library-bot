const { Markup } = require("telegraf");

const keyboards = {
  menuButton(text) {
    if (!text) text = "В меню"
    return Markup.callbackButton(text, "menu")
  },
  backButton(text) {
    if (!text) text = "Вернуться"
    return Markup.callbackButton(text, "back")
  }
}

module.exports = { keyboards };
