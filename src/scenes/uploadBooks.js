const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const axios = require("axios");
const XLSX = require("xlsx");

const config = require("../../config");
const { Book } = require("../db/Book");
const { replyWithError } = require("../components/error");
const {
  declOfNum,
  removeBreaks,
  titleCase
} = require("../helpers");

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
              const response = `Из файла "${ctx.message.document.file_name}" добавлено ${result.length} ${declOfNum(result.length, ["книга", "книги", "книг"])}`;

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
  const wb = XLSX.read(fileData);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { header:1 });

  let category;
  const formatted = [];
  data.forEach(row => {
    if (row[0]) category = row[0];
    if (!row[1] || !row[2] || row[1] === "название" || row[2] === "автор") return;

    formatted.push({
      category: removeBreaks(titleCase(category)),
      name: removeBreaks(row[1]),
      author: removeBreaks(row[2]),
      taken_by: row[3] && removeBreaks(row[3])
    });
  });

  return formatted;
}

module.exports = {
  uploadBooksScene
};
