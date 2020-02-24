const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const axios = require("axios");
const XLSX = require("xlsx");
const { socksAgent } = require("../components/socksAgent");

const config = require("../../config");
const { Book } = require("../db/Book");
const { Category } = require("../db/Category");
const { replyWithError } = require("../components/error");
const {
  declOfNum,
  removeBreaks,
  titleCase
} = require("../helpers");

const uploadBooksScene = new Scene("uploadBooksScene");

async function parseXLSX(fileData) {
  const wb = XLSX.read(fileData);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    blankrows: false,
    range: 2
  });

  const formatted = [];
  let category = {};
  for (const row of data) {
    if (row.length < 3) continue;

    if (row[0]) {
      const categoryString = removeBreaks(titleCase(row[0]));
      if (categoryString !== category.name) {
        category = await Category.getByName(categoryString);
        if (!category) category = await Category.addOne(categoryString);
      }
    }

    formatted.push({
      category,
      name: removeBreaks(row[1]),
      author: removeBreaks(row[2]),
      taken_by: row[3] && removeBreaks(row[3])
    });
  }
  return formatted;
}

uploadBooksScene.enter(ctx => {
  ctx.editMessageText(
    "Загрузите файл в формате xlsx.\n\
    Пропуск первых 2 строк\n\
    Столбцы: Раздел|Название|Автор|Кому выдана",
    Extra.HTML().markup(m =>
      m.inlineKeyboard([m.callbackButton("Отмена", "menu")])
    )
  );
});

uploadBooksScene.on("document", ctx => {
  const { mime_type: mimeType, file_id: fileId, file_name: fileName } = ctx.message.document;
  if (mimeType !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    return ctx.reply(
      "Данный файл не является xlsx",
      Extra.HTML().markup(m =>
        m.inlineKeyboard([
          m.callbackButton("Загрузить снова", "back"),
          m.callbackButton("Отмена", "menu")
        ])
      ));
  }

  ctx.telegram.getFile(fileId)
    .then(fileData => {
      let httpsAgent;
      if (config.useProxy) { httpsAgent = socksAgent; }
      axios({
        url: `https://api.telegram.org/file/bot${config.token}/${fileData.file_path}`,
        method: "GET",
        responseType: "arraybuffer",
        httpsAgent
      })
        .then(async (file) => {
          const books = await parseXLSX(file.data);
          Book.addMany(books)
            .then(result => {
              const bookCount = `${result.length} ${declOfNum(result.length, ["книга", "книги", "книг"])}`;
              const response = `Из файла "${fileName}" добавлено ${bookCount}`;
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

module.exports = {
  uploadBooksScene
};
