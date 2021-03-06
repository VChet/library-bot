const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { declOfNum } = require("../helpers");
const { User } = require("../db/User");
const { paginator } = require("../components/paginator");
const { replyWithError } = require("../components/error");

const usersScene = new Scene("usersScene");

const getRole = (ctx) => ctx.scene.session.selected.role;

usersScene.enter(ctx => {
  ctx.scene.session = {
    results: [],
    selected: {}
  };

  User.getAll()
    .then(users => {
      ctx.scene.session.results = users;
      ctx.editMessageText(
        `В базе ${users.length} ${declOfNum(users.length, ["пользователь", "пользователя", "пользователей"])}`,
        paginator.keyboard(ctx, users)
      );
    })
    .catch(error => replyWithError(ctx, error));
});

usersScene.action(/get (.+)/, (ctx) => {
  const userId = ctx.match[1];
  const userData = ctx.scene.session.results.find(user => user._id.toString() === userId.toString());
  ctx.scene.session.selected = userData;
  return ctx.editMessageText(
    `${userData.full_name} @${userData.username} (${userData.role})`,
    Extra.HTML().markup(m =>
      m.inlineKeyboard([
        [
          m.callbackButton("Повысить", "promote", getRole(ctx) === "Admin"),
          m.callbackButton("Понизить", "demote", getRole(ctx) === "Guest")
        ], [
          m.callbackButton("Назад к списку", "back"),
          m.callbackButton("В меню", "menu")
        ]
      ])
    )
  );
});

usersScene.action("promote", ctx => {
  const selectedUser = ctx.scene.session.selected;
  let newRole;
  if (selectedUser.role === "Guest") {
    newRole = "User";
  } else if (selectedUser.role === "User") {
    newRole = "Admin";
  }
  User.changeRole(selectedUser, newRole)
    .then(user => {
      if (selectedUser.chat_id && newRole === "User") {
        ctx.telegram.sendMessage(
          selectedUser.chat_id,
          "Ваш аккаунт подтвержден",
          Extra.HTML().markup(m =>
            m.inlineKeyboard([m.callbackButton("Меню", "menu")])
          )
        );
      }
      ctx.editMessageText(
        `Пользователь ${user.full_name} теперь ${user.role}`,
        paginator.basicMenu()
      );
    })
    .catch(error => replyWithError(ctx, error));
});

usersScene.action("demote", ctx => {
  const selectedUser = ctx.scene.session.selected;
  let newRole;
  if (selectedUser.role === "Admin") {
    newRole = "User";
  } else if (selectedUser.role === "User") {
    newRole = "Guest";
  }
  User.changeRole(selectedUser, newRole)
    .then(user => {
      ctx.editMessageText(
        `Пользователь ${user.full_name} теперь ${user.role}`,
        paginator.basicMenu()
      );
    })
    .catch(error => replyWithError(ctx, error));
});

module.exports = {
  usersScene
};
