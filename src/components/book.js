const { Extra } = require("telegraf");
const dayjs = require("dayjs");

const { Book } = require("../db/Book");
const { Log } = require("../db/Log");
const { replyWithError } = require("../components/error");
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
            Extra.HTML().markup(m =>
              m.inlineKeyboard([
                m.callbackButton("Назад", "back"),
                m.callbackButton("В меню", "menu")
              ])
            )
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
            Extra.HTML().markup(m =>
              m.inlineKeyboard([
                m.callbackButton("Назад", "back"),
                m.callbackButton("В меню", "menu")
              ])
            )
          );
        })
        .catch(error => replyWithError(ctx, error));
    },
    returnTaken(ctx) {
      Book.clearTaken(ctx.scene.session.selected._id)
        .then(book => {
          ctx.editMessageText(
            `Книга "${book.name}" возвращена в библиотеку`,
            Extra.HTML().markup(m =>
              m.inlineKeyboard([
                m.callbackButton("Назад", "back"),
                m.callbackButton("В меню", "menu")
              ])
            )
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
            Extra.HTML().markup(m =>
              m.inlineKeyboard([
                m.callbackButton("Назад", "back"),
                m.callbackButton("В меню", "menu")
              ])
            )
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
            const format = date => dayjs(date).format("DD-MM-YYYY");
            response = logs.map(log =>
              `[${format(log.taken)} ${format(log.returned)}] ${log.user.full_name} @${log.user.username}`
            ).join("\n");
          }

          ctx.editMessageText(
            response,
            Extra.HTML().markup(m =>
              m.inlineKeyboard([
                m.callbackButton("Назад", "back"),
                m.callbackButton("В меню", "menu")
              ])
            )
          );
        })
        .catch(error => replyWithError(ctx, error));
    }
  }
};

module.exports = { book: bookComponent };
