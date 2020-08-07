const { Category } = require("./category");
const { Book } = require("./book");
const { User } = require("./user");
const { books: defaultBooks } = require("./data_books");

async function initCollections() {
  if (process.env.NODE_ENV === "test") return;

  async function createCategory() {
    const category = await Category.findOne({}).lean();
    if (category) return category;
    const newCategory = new Category({ name: "Неотсортированные" });
    return newCategory.save();
  }

  async function createBooks(category) {
    const books = await Book.find({}).lean();
    if (books && books.length !== 0) return books;

    defaultBooks.forEach(book => {
      book.category = category;
      return book;
    });
    return Book.insertMany(defaultBooks);
  }

  async function createAdmin() {
    const user = await User.findOne({ telegram_id: process.env.ADMIN_ID }).lean();
    if (user) return user;

    const newAdmin = new User({
      telegram_id: process.env.ADMIN_ID,
      username: process.env.ADMIN_USERNAME,
      role: "Admin"
    });
    return newAdmin.save();
  }

  const category = await createCategory();
  if (process.env.INIT_BOOKS === "true") createBooks(category);
  createAdmin();
}

module.exports = { initCollections };
