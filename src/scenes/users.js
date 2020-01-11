const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const { declOfNum } = require("../helpers");
const { User } = require("../../models/user");

const usersScene = new Scene("usersScene");

const getRole = (ctx) => ctx.scene.session.users.selected.role;

usersScene.enter(ctx => {
  ctx.scene.session = {
    page: 1,
    results: {}
  };

  User.find().lean().exec((error, users) => {
    if (error) console.log(error);

    ctx.scene.session.results = users;
    ctx.editMessageText(
      `В базе ${users.length} ${declOfNum(users.length, ["пользователь", "пользователя", "пользователей"])}`,
      listKeyboard(ctx, users)
    );
  });
});

usersScene.action(/get (.+)/, (ctx) => {
  const userId = ctx.match[1];
  const userData = ctx.scene.session.results.find(user => user._id.toString() === userId.toString());
  ctx.scene.session.selected = userData;
  return ctx.editMessageText(
    `${userData.first_name} ${userData.last_name} @${userData.username} (${userData.role})`,
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
  let newRole;
  const selectedUser = ctx.scene.session.selected;
  if (selectedUser.role === "Guest") {
    newRole = "User";
  } else if (selectedUser.role === "User") {
    newRole = "Admin";
  }
  User.findByIdAndUpdate(
    selectedUser._id,
    { $set: { role: newRole } },
    { new: true },
    (error, user) => {
      if (error) console.log(error);

      ctx.editMessageText(
        `Пользователь ${user.first_name} ${user.last_name} теперь ${user.role}`,
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            m.callbackButton("Назад к списку", "back"),
            m.callbackButton("В меню", "menu")
          ])
        )
      );
    }
  );
});

usersScene.action("demote", ctx => {
  let newRole;
  const selectedUser = ctx.scene.session.selected;
  if (selectedUser.role === "Admin") {
    newRole = "User";
  } else if (selectedUser.role === "User") {
    newRole = "Guest";
  }
  User.findByIdAndUpdate(
    selectedUser._id,
    { $set: { role: newRole } },
    { new: true },
    (error, user) => {
      if (error) console.log(error);

      ctx.editMessageText(
        `Пользователь ${user.first_name} ${user.last_name} теперь ${user.role}`,
        Extra.HTML().markup(m =>
          m.inlineKeyboard([
            m.callbackButton("Назад к списку", "back"),
            m.callbackButton("В меню", "menu")
          ])
        )
      );
    }
  );
});

usersScene.action("back", ctx => {
  ctx.scene.reenter();
});

usersScene.action("menu", ctx => {
  ctx.scene.leave();
  return ctx.scene.enter("menuScene");
});

usersScene.action(/changePage (.+)/, ctx => {
  ctx.match[1] === "next" ? ctx.scene.session.page++ : ctx.scene.session.page--;

  const users = ctx.scene.session.results;
  const currentPage = ctx.scene.session.page;
  const firstUsersBorder = 1 + (currentPage - 1) * 10;
  const secondUsersBorder = currentPage * 10 > users.length ? users.length : currentPage * 10;

  const newMessage = `В базе ${users.length} ${declOfNum(users.length, ["пользователь", "пользователя", "пользователей"])} (показаны с ${firstUsersBorder} по ${secondUsersBorder})`;

  return ctx.editMessageText(newMessage, listKeyboard(ctx, users));
});

function listKeyboard(ctx, users) {
  const currentPage = ctx.scene.session.page;

  return Extra.HTML().markup(m => {
    const keyboard = [];

    if (users.length <= 10) {
      keyboard.push(...users.map(user => {
        return [
          m.callbackButton(`${user.first_name} ${user.last_name} (${user.role})`, `get ${user._id}`)
        ];
      }));
    } else if (users.length > 10) {
      keyboard.push(
        ...users.slice((currentPage - 1) * 10, currentPage * 10).map(user => [
          m.callbackButton(`${user.first_name} ${user.last_name} (${user.role})`, `get ${user._id}`)
        ])
      );

      if (currentPage === 1) {
        keyboard.push([m.callbackButton("Вперед", "changePage next")]);
      } else if (currentPage > 1 && currentPage * 10 < users.length) {
        keyboard.push([
          m.callbackButton("Назад", "changePage previous"),
          m.callbackButton("Вперед", "changePage next")
        ]);
      } else if (currentPage * 10 > users.length) {
        keyboard.push([
          m.callbackButton("Назад", "changePage previous")
        ]);
      }
    }

    return m.inlineKeyboard(keyboard);
  });
}

module.exports = {
  usersScene
};
