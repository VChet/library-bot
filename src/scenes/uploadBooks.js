const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const axios = require("axios");
const XLSX = require("xlsx");
const { socksAgent } = require("../components/socksAgent");

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
    header: 1, // Generate an array of arrays
    blankrows: false, // Skip blank lines
    range: 2 // Start from this row
  });

  const formatted = [];
  for (const row of data) {
    if (row.length < 3) continue; // Skip row if it doesnt have 3 filled columns

    const [categoryString, name, author, takenBy] = row;
    let categoryObj = {};

    if (categoryString) {
      const formattedString = removeBreaks(titleCase(categoryString));
      if (formattedString !== categoryObj.name) {
        categoryObj = await Category.getByName(categoryString);
        if (!categoryObj) categoryObj = await Category.addOne(categoryString);
      }
    }

    formatted.push({
      category: categoryObj,
      name: removeBreaks(name),
      author: removeBreaks(author),
      taken_by: takenBy && removeBreaks(takenBy)
    });
  }
  return formatted;
}

uploadBooksScene.enter(ctx => {
  const message = [];
  message.push("Загрузите файл в формате xlsx.");
  message.push("Столбцы: Раздел|Название|Автор|Кому выдана");
  ctx.editMessageText(message.join("\n"),
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
      if (process.env.PROXY_ENABLED === "true") { httpsAgent = socksAgent; }
      axios({
        url: `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${fileData.file_path}`,
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
