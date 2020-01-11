const { Extra } = require("telegraf");

const isTaken = book => book.user ? "❌" : "";
const { declOfNum } = require("../helpers");

const bookPaginator = {
  page: 1,
  keyboard(books) {
    const currentPage = bookPaginator.page;

    return Extra.HTML().markup(m => {
      const keyboard = [];

      if (books.length <= 10) {
        keyboard.push(...books.map(book => [
          m.callbackButton(
            `${book.author} — ${book.name} ${isTaken(book)}`,
            `get ${book._id}`
          )
        ]));
      } else if (books.length > 10) {
        keyboard.push(
          ...books.slice((currentPage - 1) * 10, currentPage * 10).map(book => [
            m.callbackButton(
              `${book.author} — ${book.name} ${isTaken(book)}`,
              `get ${book._id}`
            )
          ])
        );

        if (currentPage === 1) {
          keyboard.push([m.callbackButton("Вперед", "changePage next")]);
        } else if (currentPage > 1 && currentPage * 10 < books.length) {
          keyboard.push([
            m.callbackButton("Назад", "changePage previous"),
            m.callbackButton("Вперед", "changePage next")
          ]);
        } else if (currentPage * 10 > books.length) {
          keyboard.push([
            m.callbackButton("Назад", "changePage previous")
          ]);
        }
      }

      return m.inlineKeyboard(keyboard);
    });
  },
  changePageAction(ctx) {
    ctx.match[1] === "next" ?
      bookPaginator.page++ :
      bookPaginator.page--;

    const books = ctx.scene.session.results;
    const currentPage = bookPaginator.page;
    const firstBooksBorder = 1 + (currentPage - 1) * 10;
    const secondBooksBorder = currentPage * 10 > books.length ? books.length : currentPage * 10;

    const newMessage = `В библиотеке ${books.length} ${declOfNum(books.length, ["книга", "книги", "книг"])} (показаны с ${firstBooksBorder} по ${secondBooksBorder})`;

    return ctx.editMessageText(newMessage, bookPaginator.keyboard(books));
  }
};

module.exports = { bookPaginator };
