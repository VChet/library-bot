const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const axios = require("axios");
const XLSX = require("xlsx");

const config = require("../../config");
const { Book } = require("../db/Book");
const { replyWithError } = require("../components/error");
const { declOfNum } = require("../helpers");

const uploadBooksScene = new Scene("uploadBooksScene");

uploadBooksScene.enter(ctx => {
  ctx.editMessageText(
    "Загрузите файл в формате xlsx",
    Extra.HTML().markup(m =>
      m.inlineKeyboard([m.callbackButton("Отмена", "menu")])
    )
  );
});

uploadBooksScene.on("document", ctx => {
  if (ctx.message.document.mime_type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    return ctx.reply(
      "Данный файл не является xlsx",
      Extra.HTML().markup(m =>
        m.inlineKeyboard([
          m.callbackButton("Загрузить снова", "back"),
          m.callbackButton("Отмена", "menu")
        ])
      ));
  }

  ctx.telegram.getFile(ctx.message.document.file_id)
    .then(response => {
      let httpsAgent;
      if (config.useProxy) {
        const { socksAgent } = require("../components/socksAgent");
        httpsAgent = socksAgent;
      }
      axios({
        url: `https://api.telegram.org/file/bot${config.token}/${response.file_path}`,
        method: "GET",
        responseType: "arraybuffer",
        httpsAgent
      })
        .then(file => {
          const books = parseXLSX(file.data);
          Book.addMany(books)
            .then(result => {
              let error;
              if (result.errors) {
                error = `Не было добавлено ${result.errors.length} ${declOfNum(result.errors.length, ["книга", "книги", "книг"])}`;
              }
              const count = result.success;

              let response = "";
              if (count) response += `Из файла "${ctx.message.document.file_name}" добавлено ${count} ${declOfNum(count, ["книга", "книги", "книг"])}`;
              if (error) response += "\n" + error;

              ctx.reply(
                response,
                Extra.HTML().markup(m =>
                  m.inlineKeyboard([
                    m.callbackButton("Добавить ещё", "back"),
                    m.callbackButton("В меню", "menu"),
                  ])
                )
              );
            })
            .catch(error => replyWithError(ctx, error));
        })
        .catch(error => replyWithError(ctx, error));
    });
});

uploadBooksScene.action("menu", ctx => {
  ctx.scene.leave();
  return ctx.scene.enter("menuScene");
});

uploadBooksScene.action("back", ctx => {
  ctx.scene.reenter();
});

function parseXLSX(fileData) {
  const toTitleCase = s => s.substr(0, 1).toUpperCase() + s.substr(1).toLowerCase();
  const removeBreaks = s => s.replace(/(\r\n|\n|\r)/gm, " ");

  const wb = XLSX.read(fileData);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, {header:1});

  let category;
  const formatted = [];
  data.forEach(book => {
    if (book[0]) category = book[0];
    if (!book[1] || !book[2] || book[1] === "название" || book[2] === "автор" || category === "Тема") return;

    formatted.push({
      name: removeBreaks(book[1]),
      author: removeBreaks(book[2]),
      category: removeBreaks(toTitleCase(category))
    });
  });

  return formatted;
}

module.exports = {
  uploadBooksScene
};
