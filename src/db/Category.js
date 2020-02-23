const { Category } = require("../../models/category");

exports.Category = {
  getAll: () => new Promise((resolve, reject) => {
    Category.find({}).lean().exec((error, categories) => {
      if (error) reject(error);
      resolve(categories);
    });
  }),
  getByName: (name) => new Promise((resolve, reject) => {
    Category.findOne({ name }).lean().exec((error, category) => {
      if (error) reject(error);
      resolve(category);
    });
  }),
  getById: (categoryId) => new Promise((resolve, reject) => {
    Category.findById(categoryId).lean().exec((error, category) => {
      if (error) reject(error);
      resolve(category);
    });
  }),
  changeName: (categoryId, name) => new Promise((resolve, reject) => {
    Category.findByIdAndUpdate(
      categoryId,
      { $set: { name } },
      { new: true },
      (error, category) => {
        if (error) reject(error);
        resolve(category);
      });
  }),
  addOne: (name) => new Promise((resolve, reject) => {
    Category.create({ name }, (error, category) => {
      if (error) reject(error);
      resolve(category);
    });
  }),
  delete: (categoryId) => new Promise((resolve, reject) => {
    Category.deleteOne(categoryId, (error, category) => {
      if (error) reject(error);
      resolve(category);
    });
  }),
};
