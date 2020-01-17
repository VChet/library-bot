const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { Book } = require("../db/Book");
const { User } = require("../db/User");
const { Category } = require("../db/Category");
const { replyWithError } = require("../components/error");
const { paginator } = require("../components/paginator");
const { declOfNum } = require("../helpers");

const searchBookScene = new Scene("searchBookScene");

const hideButton = (ctx) => ctx.session.user.role !== "Admin";

searchBookScene.enter(ctx => {
  ctx.editMessageText(
    "Введите название книги или автора",
    Extra.HTML().markup(m =>
      m.inlineKeyboard([m.callbackButton("Отменить поиск", "menu")])
    )
  );
});

searchBookScene.on("message", ctx => {
  ctx.scene.session = {
    query: ctx.message.text,
    results: [],
    selected: {}
  };

  Book.getByQuery(ctx.message.text)
    .then(books => {
      if (books.length) {
        ctx.scene.session.results = books;
        return ctx.reply(
          `Найдено ${books.length} ${declOfNum(books.length, ["книга", "книги", "книг"])}:`,
          paginator.keyboard(ctx, books)
        );
      }
      ctx.reply(
        "Ничего не найдено",
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            m.callbackButton("Искать ещё", "back"),
            m.callbackButton("В меню", "menu")
          ])
        )
      );
    })
    .catch(error => replyWithError(ctx, error));
});

searchBookScene.action(/get (.+)/, async (ctx) => {
  const bookId = ctx.match[1];
  const bookData = ctx.scene.session.results.find(book => book._id.toString() === bookId.toString());
  ctx.scene.session.selected = bookData;
  if (bookData.user || bookData.taken_by) {
    if (bookData.user && bookData.user.toString() === ctx.session.user._id.toString()) {
      const category = await Category.getById(bookData.category);
      const response = `Вернуть "${bookData.author} — ${bookData.name}"?\nРаздел "${category.name}"`;
      return ctx.editMessageText(
        response,
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            [
              m.callbackButton("Вернуть книгу", "return")
            ], [
              m.callbackButton("⚠️ Изменить", "edit", hideButton(ctx)),
              m.callbackButton("⚠️ В архив", "archiveCheck", hideButton(ctx))
            ], [
              m.callbackButton("Искать ещё", "back"),
              m.callbackButton("В меню", "menu")
            ]
          ])
        )
      );
    }

    let user;
    if (bookData.user) {
      const userData = await User.getById(bookData.user);
      user = `@${userData.username}`;
    } else {
      user = bookData.taken_by;
    }

    return ctx.editMessageText(
      `${bookData.name} сейчас у ${user}`,
      Extra.HTML().markup(m =>
        m.inlineKeyboard([
          [
            m.callbackButton("Искать ещё", "back"),
            m.callbackButton("В меню", "menu")
          ], [
            m.callbackButton("⚠️ Книга была возвращена", "returnTaken", hideButton(ctx) && bookData.taken_by)
          ]
        ])
      )
    );
  } else {
    ctx.editMessageText(
      `Выбранная книга: ${bookData.author} — ${bookData.name}.`,
      Extra.HTML().markup(m =>
        m.inlineKeyboard([
          [
            m.callbackButton("Взять книгу", "take")
          ], [
            m.callbackButton("⚠️ Изменить", "edit", hideButton(ctx)),
            m.callbackButton("⚠️ В архив", "archiveCheck", hideButton(ctx))
          ], [
            m.callbackButton("Искать ещё", "back"),
            m.callbackButton("В меню", "menu")
          ]
        ])
      )
    );
  }
});

searchBookScene.action("return", ctx => {
  const bookId = ctx.scene.session.selected._id;
  Book.clearUser(bookId)
    .then(book => {
      ctx.editMessageText(
        `Вы вернули книгу "${book.author} — ${book.name}". Спасибо!`,
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            m.callbackButton("Искать ещё", "back"),
            m.callbackButton("В меню", "menu")
          ])
        )
      );
    })
    .catch(error => replyWithError(ctx, error));
});

searchBookScene.action("returnTaken", ctx => {
  Book.clearTaken(ctx.scene.session.selected._id)
    .then(book => {
      ctx.editMessageText(
        `Книга "${book.name}" возвращена в библиотеку`,
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            m.callbackButton("Искать ещё", "back"),
            m.callbackButton("В меню", "menu")
          ])
        )
      );
    })
    .catch(error => replyWithError(ctx, error));
});

searchBookScene.action("take", ctx => {
  const bookId = ctx.scene.session.selected._id;
  const userId = ctx.session.user._id;

  Book.changeUser(bookId, userId)
    .then(book => {
      ctx.editMessageText(
        `Теперь книга "${book.name}" закреплена за вами!`,
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            m.callbackButton("Искать ещё", "back"),
            m.callbackButton("В меню", "menu")
          ])
        )
      );
    })
    .catch(error => replyWithError(ctx, error));
});

searchBookScene.action("archiveCheck", ctx => {
  ctx.editMessageText(
    `Архивировать "${ctx.scene.session.selected.name}"? Книга будет недоступна и перестанет отображаться в поиске. Внимание, это действие необратимо!`,
    Extra.HTML().markup(m =>
      m.inlineKeyboard([
        [m.callbackButton("Понятно, в архив!", "archive")],
        [
          m.callbackButton("Вернуться в поиск", "back"),
          m.callbackButton("В меню", "menu")
        ]
      ])
    )
  );
});

searchBookScene.action("edit", ctx => {
  ctx.session.selectedBook = ctx.scene.session.selected;
  ctx.scene.leave();
  return ctx.scene.enter("editBookScene");
});

searchBookScene.action("archive", ctx => {
  Book.archive(ctx.scene.session.selected._id)
    .then(book => {
      ctx.editMessageText(
        `Книга "${book.name}" добавлена в архив`,
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            m.callbackButton("Вернуться в поиск", "back"),
            m.callbackButton("В меню", "menu")
          ])
        )
      );
    })
    .catch(error => replyWithError(ctx, error));
});

module.exports = {
  searchBookScene
};
