const { Category } = require("./category");
const { Book } = require("./book");
const { User } = require("./user");
const { admins } = require("./data_admins");

async function initCollections() {
  if (process.env.NODE_ENV === "test") return;

  async function createCategory() {
    const category = await Category.findOne({}).lean();
    if (category) return category;
    const newCategory = new Category({ name: "Художественная литература" });
    return await newCategory.save();
  }

  async function createBooks(category) {
    const books = await Book.find({}).lean();
    if (books && books.length !== 0) return books;
    const newBooks = [
      { name: "First Book", category },
      { name: "Second Book", category },
      { name: "Third Book", category },
      { name: "Fourth Book", category }
    ];
    return await Book.insertMany(newBooks);
  }

  async function createAdmin() {
    const adminIds = admins.map(admin => admin.telegram_id);

    const user = await User.find({ telegram_id: { $in: adminIds } }).lean();
    if (user.length) return user;

    return await User.insertMany(admins);
  }

  const category = await createCategory();
  await createBooks(category);
  createAdmin();
}

module.exports = { initCollections };
