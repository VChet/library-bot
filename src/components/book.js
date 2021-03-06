const { Extra } = require("telegraf");

const { Book } = require("../db/Book");
const { Log } = require("../db/Log");
const { replyWithError } = require("./error");
const { paginator } = require("./paginator");
const { hideButton } = require("../helpers");

const bookComponent = {
  keyboard(ctx, button) {
    return Extra.HTML().markup(m =>
      m.inlineKeyboard([
        [
          m.callbackButton(button.text, button.action)
        ], [
          m.callbackButton("Назад", "back"),
          m.callbackButton("В меню", "menu")
        ], [
          m.callbackButton("⚠️ История", "logs", hideButton(ctx)),
          m.callbackButton("⚠️ Изменить", "edit", hideButton(ctx)),
          m.callbackButton("⚠️ В архив", "archiveCheck", hideButton(ctx))
        ]
      ])
    );
  },
  actions: {
    take(ctx) {
      const bookId = ctx.scene.session.selected._id;
      const userId = ctx.session.user._id;
      Book.changeUser(bookId, userId)
        .then(book => {
          ctx.editMessageText(
            `Теперь книга "${book.name}" закреплена за вами!`,
            paginator.basicMenu()
          );
        })
        .catch(error => replyWithError(ctx, error));
    },
    return(ctx) {
      const bookId = ctx.scene.session.selected._id;
      Book.clearUser(bookId)
        .then(book => {
          ctx.editMessageText(
            `Вы вернули книгу "${book.name_author}". Спасибо!`,
            paginator.basicMenu()
          );
        })
        .catch(error => replyWithError(ctx, error));
    },
    returnTaken(ctx) {
      Book.clearTaken(ctx.scene.session.selected._id)
        .then(book => {
          ctx.editMessageText(
            `Книга "${book.name}" возвращена в библиотеку`,
            paginator.basicMenu()
          );
        })
        .catch(error => replyWithError(ctx, error));
    },
    edit(ctx) {
      ctx.session.selectedBook = ctx.scene.session.selected;
      ctx.scene.leave();
      return ctx.scene.enter("editBookScene");
    },
    archive(ctx) {
      Book.archive(ctx.scene.session.selected._id)
        .then(book => {
          ctx.editMessageText(
            `Книга "${book.name}" добавлена в архив`,
            paginator.basicMenu()
          );
        })
        .catch(error => replyWithError(ctx, error));
    },
    archiveCheck(ctx) {
      let response = `Архивировать "${ctx.scene.session.selected.name}"?`;
      response += "\nКнига будет недоступна и перестанет отображаться в поиске. Внимание, это действие необратимо!";
      ctx.editMessageText(
        response,
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            [m.callbackButton("Понятно, в архив!", "archive")],
            [
              m.callbackButton("Назад", "back"),
              m.callbackButton("В меню", "menu")
            ]
          ])
        )
      );
    },
    logs(ctx) {
      const bookId = ctx.scene.session.selected._id;
      Log.getByBook(bookId)
        .then(logs => {
          let response = "Нет записей";
          if (logs.length) {
            response = logs.map(log =>
              `[${log.dates}] ${log.user.full_name} @${log.user.username}`
            ).join("\n");
          }

          ctx.editMessageText(
            response,
            paginator.basicMenu()
          );
        })
        .catch(error => replyWithError(ctx, error));
    },
    inlineSearch(ctx) {
      const { query } = ctx.inlineQuery;
      if (query.length < 3) return;
      Book.getByQuery(query)
        .then(books => {
          const array = books.map(bookData => {
            const user = bookData.user ?
              `@${bookData.user.username}` :
              bookData.taken_by;
            let answer = bookData.name_author;
            answer += user ?
              `\nСейчас у ${user}` :
              `\nСейчас на полке "${bookData.category.name}"`;
            return ({
              type: "article",
              id: bookData.id,
              title: bookData.name,
              description: bookData.author,
              input_message_content: { message_text: answer }
            });
          });
          return ctx.answerInlineQuery(array);
        });
    }
  },
};

module.exports = { book: bookComponent };
