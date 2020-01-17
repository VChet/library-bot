const { Category } = require("./category");
const { Book } = require("./book");
const { User } = require("./user");
const config = require("../config");

async function initCollections() {
  if (process.env.NODE_ENV === "test") return;

  async function createCategory() {
    const category = await Category.findOne({}).lean();
    if (category) return category;
    const newCategory = new Category({ name: "Неотсортированные" });
    return await newCategory.save();
  }

  async function createBooks(category) {
    const books = await Book.find({}).lean();
    if (books && books.length !== 0) return books;

    const { books: defaultBooks } = require("./data_books");
    defaultBooks.forEach(book => {
      book.category = category;
      return book;
    });
    return await Book.insertMany(defaultBooks);
  }

  async function createAdmin() {
    const user = await User.findOne({ telegram_id: config.defaultAdmin.telegram_id }).lean();
    if (user) return user;

    const newAdmin = new User(config.defaultAdmin);
    return await newAdmin.save();
  }

  const category = await createCategory();
  if (config.initDefaultBooks) createBooks(category);
  createAdmin();
}

module.exports = { initCollections };
