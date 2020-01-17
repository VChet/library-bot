const { Category } = require("../../models/category");

exports.Category = {
  getByName: (name) => new Promise((resolve, reject) => {
    Category.findOne({ name }).lean().exec((error, book) => {
      if (error) reject(error);
      resolve(book);
    });
  }),
  getById: (categoryId) => new Promise((resolve, reject) => {
    Category.findById(categoryId).lean().exec((error, book) => {
      if (error) reject(error);
      resolve(book);
    });
  }),
};
