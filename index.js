// Silence Telegram Bot Api deprecated error
process.env["NTBA_FIX_319"] = 1;

const TelegramBot = require("node-telegram-bot-api");
const Agent = require("socks5-https-client/lib/Agent");
const mongoose = require("mongoose");

const config = require("./config");
const { initCollections } = require("./models/init");
const { Book } = require("./models/book");

const state = {
  isAddingBook: false,
  isSearchingBook: false,
  isTakingBook: false
};

let data = {};

// TODO: move database connect and configuration to separate file
mongoose.connect(config.mongoUrl, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on("error", console.error.bind(console, "MongoDB connection error:"));
initCollections();

const bot = new TelegramBot(config.token, {
  polling: true,
  request: {
    agentClass: Agent,
    agentOptions: {
      socksHost: config.socks.host,
      socksPort: parseInt(config.socks.port),
      socksUsername: config.socks.username,
      socksPassword: config.socks.password
    }
  }
});

// TODO: move functions to separate files
bot.onText(/\/start/, msg => {
  const chatId = msg.chat.id;
  const sender = msg.from;
  const response = `Привет, ${sender.username}`;

  bot.sendMessage(chatId, response);
});

bot.onText(/\/add_book (.+) (.+)/, (msg, match) => {
  state.isAddingBook = true;
  const chatId = msg.chat.id;
  const author = match[1];
  const name = match[2];
  const response = `Добавить книгу? Автор: ${author}. Название: ${name}`;
  data = { name, author };

  const opts = {
    reply_markup: JSON.stringify({
      keyboard: [["Да"], ["Нет"]]
    })
  };
  bot.sendMessage(chatId, response, opts);
});

bot.onText(/Да/, msg => {
  if (state.isAddingBook) {
    const chatId = msg.chat.id;

    const newBook = new Book(data);
    newBook.save();

    const response = "Добавлено!";
    const opts = {
      reply_markup: JSON.stringify({
        hide_keyboard: true
      })
    };
    bot.sendMessage(chatId, response, opts);
  }
});

bot.onText(/Нет/, msg => {
  if (state.isAddingBook) {
    const chatId = msg.chat.id;

    const response = "Отменяю";
    const opts = {
      reply_markup: JSON.stringify({
        hide_keyboard: true
      })
    };
    bot.sendMessage(chatId, response, opts);
  }
});

bot.onText(/\/take_book/, msg => {
  state.isSearchingBook = true;
  const chatId = msg.chat.id;
  const response = "Введи название книги или автора";

  bot.sendMessage(chatId, response);
});

bot.on("message", msg => {
  if (state.isSearchingBook) {
    const chatId = msg.chat.id;
    Book.find({ $text: { $search: msg.text } }).lean().exec((error, books) => {
      if (error) return console.log(error);
      if (books.length) {
        const response = books.map(book => {
          let item = book.author ? book.author + " " : "";
          item += book.name;
          return item;
        }).join(", ");
        bot.sendMessage(chatId, response);
      } else {
        bot.sendMessage(chatId, "Ничего не нашел");
        state.isSearchingBook = false;
      }
    });
  }
});
