const { Book } = require("../../models/book");

exports.Book = {
  getAll: () => new Promise((resolve, reject) => {
    Book.find().lean().exec((error, books) => {
      if (error) reject(error);
      resolve(books);
    });
  }),
  getAvailable: () => new Promise((resolve, reject) => {
    Book.find({
      user: null,
      taken_by: "",
      is_archived: false
    }).lean().exec((error, books) => {
      if (error) reject(error);
      resolve(books);
    });
  }),
  getUnavailable: () => new Promise((resolve, reject) => {
    Book.find({
      or: [
        { user: { $ne: null } },
        { taken_by: { $ne: "" } }
      ],
      is_archived: false
    }).populate("user").lean().exec((error, books) => {
      if (error) reject(error);
      resolve(books);
    });
  }),
  getByQuery: (query) => new Promise((resolve, reject) => {
    Book.find({ $text: { $search: query }, is_archived: false }).lean().exec((error, books) => {
      if (error) reject(error);
      resolve(books);
    });
  }),
  getByUser: (userId) => new Promise((resolve, reject) => {
    Book.find({ user: userId }).lean().exec((error, books) => {
      if (error) reject(error);
      resolve(books);
    });
  }),
  isExists: (author, name) => new Promise((resolve, reject) => {
    Book.findOne({ author, name }).lean().exec((error, book) => {
      if (error) reject(error);
      resolve(book);
    });
  }),
  changeData: (bookData) => new Promise((resolve, reject) => {
    Book.findByIdAndUpdate(
      bookData._id,
      { $set: bookData },
      { new: true },
      (error, book) => {
        if (error) reject(error);
        resolve(book);
      });
  }),
  changeUser: (bookId, userId) => new Promise((resolve, reject) => {
    Book.findByIdAndUpdate(
      bookId,
      { $set: { user: userId } },
      { new: true },
      (error, book) => {
        if (error) reject(error);
        resolve(book);
      });
  }),
  clearUser: (bookId) => new Promise((resolve, reject) => {
    Book.findByIdAndUpdate(
      bookId,
      { $set: { user: null } },
      { new: true },
      (error, book) => {
        if (error) reject(error);
        resolve(book);
      });
  }),
  clearTaken: (bookId) => new Promise((resolve, reject) => {
    Book.findByIdAndUpdate(
      bookId,
      { $set: { taken_by: "" } },
      { new: true },
      (error, book) => {
        if (error) reject(error);
        resolve(book);
      }
    );
  }),
  archive: (bookId) => new Promise((resolve, reject) => {
    Book.findByIdAndUpdate(
      bookId,
      { $set: { is_archived: true } },
      { new: true },
      (error, book) => {
        if (error) reject(error);
        resolve(book);
      }
    );
  }),
  addOne: (bookData) => new Promise((resolve, reject) => {
    Book.create(
      bookData,
      (error, book) => {
        if (error) reject(error);
        resolve(book);
      }
    );
  }),
  addMany: (booksArray) => new Promise((resolve, reject) => {
    Book.insertMany(
      booksArray,
      (error, book) => {
        if (error) reject(error);
        resolve(book);
      }
    );
  })
};
