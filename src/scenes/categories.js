const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { declOfNum } = require("../helpers");
const { Category } = require("../db/Category");
const { Book } = require("../db/Book");
const { paginator } = require("../components/paginator");
const { replyWithError } = require("../components/error");

const categoriesScene = new Scene("categoriesScene");

categoriesScene.enter(ctx => {
  ctx.scene.session = {
    results: [],
    selected: {}
  };

  Category.getAll()
    .then(categories => {
      ctx.scene.session.results = categories;
      ctx.editMessageText(
        `В базе ${categories.length} ${declOfNum(categories.length, ["раздел", "раздела", "разделов"])}`,
        paginator.keyboard(ctx, categories)
      );
    })
    .catch(error => replyWithError(ctx, error));
});

categoriesScene.action(/get (.+)/, async (ctx) => {
  const categoryId = ctx.match[1];
  const categoryData = ctx.scene.session.results.find(category => category._id.toString() === categoryId.toString());
  ctx.scene.session.selected = categoryData;
  const books = await Book.getByCategory(categoryId);
  const hideButton = books.length > 0;
  return ctx.editMessageText(
    `Раздел ${categoryData.name}.\nСодержит ${books.length} ${declOfNum(books.length, ["книга", "книги", "книг"])}`,
    Extra.HTML().markup(m =>
      m.inlineKeyboard([
        [
          m.callbackButton("Изменить название", "rename"),
          m.callbackButton("Удалить", "delete", hideButton),
        ], [
          m.callbackButton("Назад к списку", "back"),
          m.callbackButton("В меню", "menu")
        ]
      ])
    )
  );
});

categoriesScene.action("rename", ctx => {
  ctx.editMessageText(
    "Введите новое название",
    Extra.HTML().markup(m =>
      m.inlineKeyboard([m.callbackButton("Отмена", "menu")])
    )
  );
});

categoriesScene.action("delete", ctx => {
  Category.delete(ctx.scene.session.selected)
    .then(() => {
      ctx.editMessageText(
        `Категория удалена`,
        paginator.basicMenu()
      );
    })
    .catch(error => replyWithError(ctx, error));
});

categoriesScene.on("message", ctx => {
  if (!ctx.message.text) {
    ctx.reply(
      "Что-то не так. Попробуйте снова",
      Extra.HTML().markup(m =>
        m.inlineKeyboard([m.callbackButton("Отмена", "menu")])
      )
    );
  }

  ctx.scene.session.selected.newName = ctx.message.text;

  ctx.reply(
    `Изменить название с ${ctx.scene.session.selected.name} на ${ctx.scene.session.selected.newName}?`,
    Extra.HTML().markup(m =>
      m.inlineKeyboard([
        m.callbackButton("Да", "edit"),
        m.callbackButton("Нет", "back"),
      ])
    )
  );
});

categoriesScene.action("edit", ctx => {
  Category.changeName(ctx.scene.session.selected, ctx.scene.session.selected.newName)
    .then(category => {
      ctx.editMessageText(
        `Имя раздела изменено на "${category.name}"`,
        Extra.HTML().markup(m =>
          m.inlineKeyboard([m.callbackButton("В меню", "menu")])
        )
      );
    })
    .catch(error => replyWithError(ctx, error));
});

module.exports = {
  categoriesScene
};
