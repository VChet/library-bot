const { Book } = require("./book");
const { User } = require("./user");
const config = require("../config");
const { books: defaultBooks } = require("./data_books");

async function initCollections() {
  if (process.env.NODE_ENV === "test") return;

  async function createBooks() {
    const books = await Book.find({}).lean();
    if (books && books.length !== 0) return books;

    return await Book.insertMany(defaultBooks);
  }

  async function createAdmin() {
    const user = await User.findOne({ telegram_id: config.defaultAdmin.telegram_id }).lean();
    if (user) return user;

    const newAdmin = new User(config.defaultAdmin);
    return await newAdmin.save();
  }

  createBooks();
  createAdmin();
}

module.exports = { initCollections };
