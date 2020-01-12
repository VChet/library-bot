const Scene = require("telegraf/scenes/base");
const { Extra } = require("telegraf");

const axios = require("axios");
const XLSX = require("xlsx");

const config = require("../../config");
const { socksAgent } = require("../components/socksAgent");
const { Book } = require("../../models/book");

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
  const keyboard = Extra.HTML().markup(m =>
    m.inlineKeyboard([m.callbackButton("Загрузить снова", "back"), m.callbackButton("Отмена", "menu")])
  );

  if (ctx.message.document.mime_type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    ctx.telegram.getFile(ctx.message.document.file_id)
      .then(response => {
        const httpsAgent = config.useProxy ? socksAgent : {};
        axios({
          url: `https://api.telegram.org/file/bot${config.token}/${response.file_path}`,
          method: "GET",
          responseType: "arraybuffer",
          httpsAgent
        })
          .then(file => {
            const books = parseXLSX(file.data);

            Book.insertMany(books, (error, book) => {
              if (error) console.log(error);

              ctx.reply(
                `Книги из файла "${ctx.message.document.file_name}" добавлены!`,
                Extra.HTML().markup(m =>
                  m.inlineKeyboard([
                    m.callbackButton("Добавить ещё", "back"),
                    m.callbackButton("В меню", "menu"),
                  ])
                )
              );
            });
          })
          .catch(error => {
            console.log(error);
            ctx.reply("Ошибка при скачивании файла ботом", keyboard);
          });
      })
      .catch(error => {
        console.log(error);
        ctx.reply("Ошибка при загрузке файла", keyboard);
      });
  } else {
    ctx.reply("Данный файл не является xlsx", keyboard);
  }
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

  const formatted = data.map(book => {
    if (book[0]) category = book[0];
    if (!book[1] || !book[2]) return;
    return {
      name: removeBreaks(book[1]),
      author: removeBreaks(book[2]),
      category: removeBreaks(toTitleCase(category))
    };
  });

  return formatted;
}

module.exports = {
  uploadBooksScene
};
