const Scene = require("telegraf/scenes/base");
const { Book } = require("../../models/book");

const searchBookScene = new Scene("searchBookScene");

searchBookScene.enter(ctx => {
  ctx.reply("Введи название книги или автора");
});

searchBookScene.on("message", ctx => {
  Book.find({ $text: { $search: ctx.message.text } }).lean().exec((error, books) => {
    if (error) return console.log(error);
    if (books.length) {
      const response = books.map(book => {
        let item = book.author ? book.author + " " : "";
        item += book.name;
        return item;
      }).join("\n");
      ctx.reply(`Найдено ${books.length} книг: \n${response}`);
    } else {
      ctx.reply("Ничего не найдено");
    }
    ctx.scene.leave();
  });
});

module.exports = {
  searchBookScene
};
