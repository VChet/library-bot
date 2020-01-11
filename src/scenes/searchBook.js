const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { Book } = require("../../models/book");
const { User } = require("../../models/user");
const { replyWithError } = require("../components/error");
const { bookPaginator } = require("../components/bookPaginator");
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
    query: "",
    results: [],
    selected: {}
  };

  ctx.scene.session.query = ctx.message.text;

  Book.find({ $text: { $search: ctx.message.text }, is_archived: false }).lean().exec((error, books) => {
    if (error) replyWithError(ctx, error);
    if (books.length) {
      ctx.reply(
        `Найдено ${books.length} ${declOfNum(books.length, ["книга", "книги", "книг"])}:`,
        bookPaginator.keyboard(books)
      );
    } else {
      ctx.reply(
        "Ничего не найдено",
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            m.callbackButton("Искать ещё", "findAgain"),
            m.callbackButton("В меню", "menu")
          ])
        )
      );
    }
  });
});

searchBookScene.action(/get (.+)/, (ctx) => {
  const bookId = ctx.match[1];
  const bookData = ctx.scene.session.results.find(book => book._id.toString() === bookId.toString());
  ctx.scene.session.selected = bookData;
  if (bookData.user) {
    if (bookData.user.toString() === ctx.session.user._id.toString()) {
      let response = `Вернуть "${bookData.author} — ${bookData.name}"?`;
      if (bookData.category) response += `\nРаздел "${bookData.category}"`;
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
              m.callbackButton("Искать ещё", "findAgain"),
              m.callbackButton("В меню", "menu")
            ]
          ])
        )
      );
    }

    User.findById(bookData.user).lean().exec((error, user) => {
      if (error) replyWithError(ctx, error);

      return ctx.editMessageText(
        `${bookData.name} сейчас у @${user.username}`,
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            m.callbackButton("Искать ещё", "findAgain"),
            m.callbackButton("В меню", "menu")
          ])
        )
      );
    });
  } else {
    return ctx.editMessageText(
      `Выбранная книга: ${bookData.author} — ${bookData.name}.`,
      Extra.HTML().markup(m =>
        m.inlineKeyboard([
          [
            m.callbackButton("Взять книгу", "take")
          ], [
            m.callbackButton("⚠️ Изменить", "edit", hideButton(ctx)),
            m.callbackButton("⚠️ В архив", "archiveCheck", hideButton(ctx))
          ], [
            m.callbackButton("Искать ещё", "findAgain"),
            m.callbackButton("В меню", "menu")
          ]
        ])
      )
    );
  }
});

searchBookScene.action("return", ctx => {
  Book.findByIdAndUpdate(
    ctx.scene.session.selected._id,
    { $set: { user: null } },
    { new: true },
    (error, book) => {
      if (error) replyWithError(ctx, error);

      ctx.editMessageText(
        `Вы вернули книгу "${book.author} — ${book.name}". Спасибо!`,
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            m.callbackButton("Искать ещё", "findAgain"),
            m.callbackButton("В меню", "menu")
          ])
        )
      );
    }
  );
});

searchBookScene.action("take", ctx => {
  Book.findByIdAndUpdate(
    ctx.scene.session.selected._id,
    { $set: { user: ctx.session.user._id } },
    { new: true },
    (error, book) => {
      if (error) replyWithError(ctx, error);

      ctx.editMessageText(
        `Теперь книга "${book.name}" закреплена за вами!`,
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            m.callbackButton("Искать ещё", "findAgain"),
            m.callbackButton("В меню", "menu")
          ])
        )
      );
    }
  );
});

searchBookScene.action("archiveCheck", ctx => {
  ctx.editMessageText(
    `Архивировать "${ctx.scene.session.selected.name}"? Книга будет недоступна и перестанет отображаться в поиске. Внимание, это действие необратимо!`,
    Extra.HTML().markup(m =>
      m.inlineKeyboard([
        [m.callbackButton("Понятно, в архив!", "archive")],
        [
          m.callbackButton("Вернуться в поиск", "findAgain"),
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
  Book.findByIdAndUpdate(
    ctx.scene.session.selected._id,
    { $set: { is_archived: true } },
    { new: true },
    (error, book) => {
      if (error) replyWithError(ctx, error);

      ctx.editMessageText(
        `Книга "${book.name}" архивирована`,
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            m.callbackButton("Вернуться в поиск", "findAgain"),
            m.callbackButton("В меню", "menu")
          ])
        )
      );
    }
  );
});

searchBookScene.action("findAgain", ctx => {
  ctx.scene.reenter();
});

searchBookScene.action("menu", ctx => {
  ctx.scene.leave();
  return ctx.scene.enter("menuScene");
});

searchBookScene.action(/changePage (.+)/, bookPaginator.changePageAction);

module.exports = {
  searchBookScene
};
