const { Extra } = require("telegraf");
const { keyboards } = require("./keyboards");

const { declOfNum } = require("../helpers");

const booksKeyboardScenes = ["availableBooksScene", "returnBookScene", "searchBookScene"];
const usersKeyboardScenes = ["usersScene"];

const isTaken = book => book.user ? "❌" : "";

const paginator = {
  page: 1,
  keyboard(ctx, items) {
    const currentPage = paginator.page;

    return Extra.HTML().markup(m => {
      const keyboard = [];
      const itemsLength = items.length;

      if (itemsLength >= 10) items = items.slice((currentPage - 1) * 10, currentPage * 10);

      keyboard.push(...items.map(item => {
        if (booksKeyboardScenes.indexOf(ctx.scene.session.current) !== -1) {
          return [m.callbackButton(
            `${item.author} — ${item.name} ${isTaken(item)}`,
            `get ${item._id}`
          )];
        } else if (usersKeyboardScenes.indexOf(ctx.scene.session.current) !== -1) {
          return [m.callbackButton(
            `${item.first_name} ${item.last_name} (${item.role})`,
            `get ${item._id}`
          )];
        }
      }));

      if (itemsLength > 10) {
        if (currentPage === 1) {
          keyboard.push([
            keyboards.menuButton(),
            m.callbackButton("Вперед", "changePage next")
          ]);
        } else if (currentPage > 1 && currentPage * 10 < itemsLength) {
          keyboard.push([
            m.callbackButton("Назад", "changePage previous"),
            keyboards.menuButton(),
            m.callbackButton("Вперед", "changePage next")
          ]);
        } else if (currentPage * 10 >= itemsLength) {
          keyboard.push([
            keyboards.menuButton(),
            m.callbackButton("Назад", "changePage previous")
          ]);
        }
      } else {
        keyboard.push([
          keyboards.menuButton()
        ]);
      }

      return m.inlineKeyboard(keyboard);
    });
  },
  changePageAction(ctx, items) {
    ctx.match[1] === "next" ?
      paginator.page++ :
      paginator.page--;

    const currentPage = paginator.page;
    const firstItemsBorder = 1 + (currentPage - 1) * 10;
    const secondItemsBorder = currentPage * 10 > items.length ? items.length : currentPage * 10;

    let newMessage = "";

    switch (ctx.scene.session.current) {
      case ("availableBooksScene"):
        newMessage = `В библиотеке ${items.length} ${declOfNum(items.length, ["книга", "книги", "книг"])} (показаны с ${firstItemsBorder} по ${secondItemsBorder})`;
        break;
      case ("usersScene"):
        newMessage = `В базе ${items.length} ${declOfNum(items.length, ["пользователь", "пользователя", "пользователей"])} (показаны с ${firstUsersBorder} по ${secondUsersBorder})`;
        break;
    }

    return ctx.editMessageText(newMessage, paginator.keyboard(ctx, items));
  }
};

module.exports = { paginator };
