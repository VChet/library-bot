const { Extra, Markup } = require("telegraf");

const { declOfNum } = require("../helpers");

const booksKeyboardScenes = ["availableBooksScene", "unavailableBooksScene", "searchBookScene", "returnBookScene"];
const usersKeyboardScenes = ["usersScene"];
const categoryKeyboardScenes = ["categoriesScene"];

const isTaken = book => book.user || book.taken_by ? "❌" : "";

const paginator = {
  page: 1,
  keyboard(ctx, items) {
    const currentPage = paginator.page;

    return Extra.HTML().markup(m => {
      const keyboard = [];
      const itemsLength = items.length;

      if (itemsLength >= 10) items = items.slice((currentPage - 1) * 10, currentPage * 10);

      keyboard.push(...items.map(item => {
        if (booksKeyboardScenes.includes(ctx.scene.session.current)) {
          return [m.callbackButton(
            `${item.name_author} ${isTaken(item)}`,
            `get ${item._id}`
          )];
        } else if (usersKeyboardScenes.includes(ctx.scene.session.current)) {
          return [m.callbackButton(
            `${item.full_name} (${item.role})`,
            `get ${item._id}`
          )];
        } else if (categoryKeyboardScenes.includes(ctx.scene.session.current)) {
          return [m.callbackButton(
            item.name,
            `get ${item._id}`
          )];
        }
      }));

      if (itemsLength > 10) {
        if (currentPage === 1) {
          keyboard.push([
            Markup.callbackButton("В меню", "menu"),
            m.callbackButton("➡️", "changePage next")
          ]);
        } else if (currentPage > 1 && currentPage * 10 < itemsLength) {
          keyboard.push([
            m.callbackButton("⬅️", "changePage previous"),
            Markup.callbackButton("В меню", "menu"),
            m.callbackButton("➡️", "changePage next")
          ]);
        } else if (currentPage * 10 >= itemsLength) {
          keyboard.push([
            m.callbackButton("⬅️", "changePage previous"),
            Markup.callbackButton("В меню", "menu")
          ]);
        }
      } else {
        keyboard.push([
          Markup.callbackButton("В меню", "menu")
        ]);
      }

      return m.inlineKeyboard(keyboard);
    });
  },
  changePageAction(ctx) {
    const items = ctx.scene.session.results;
    ctx.match[1] === "next" ?
      paginator.page++ :
      paginator.page--;

    const currentPage = paginator.page;
    const firstItemsBorder = 1 + (currentPage - 1) * 10;
    const secondItemsBorder = currentPage * 10 > items.length ? items.length : currentPage * 10;

    let newMessage = "";
    switch (ctx.scene.session.current) {
      case ("availableBooksScene"):
        newMessage = `В библиотеке ${items.length} ${declOfNum(items.length, ["книга", "книги", "книг"])}`;
        break;
      case ("unavailableBooksScene"):
        newMessage = `Сейчас на руках ${items.length} ${declOfNum(items.length, ["книга", "книги", "книг"])}`;
        break;
      case ("searchBookScene"):
        newMessage = `Найдено ${items.length} ${declOfNum(items.length, ["книга", "книги", "книг"])}`;
        break;
      case ("returnBookScene"):
        newMessage = `У вас ${items.length} ${declOfNum(items.length, ["книга", "книги", "книг"])}. Выберите книгу, которую хотите вернуть`;
        break;
      case ("usersScene"):
        newMessage = `В базе ${items.length} ${declOfNum(items.length, ["пользователь", "пользователя", "пользователей"])}`;
        break;
      case ("categoriesScene"):
        newMessage = `В базе ${items.length} ${declOfNum(items.length, ["раздел", "раздела", "разделов"])}`;
        break;
    }
    newMessage += `\n(показаны с ${firstItemsBorder} по ${secondItemsBorder})`;

    return ctx.editMessageText(newMessage, paginator.keyboard(ctx, items));
  }
};

module.exports = { paginator };
