const mongoose = require("mongoose");
const { Book } = require("../../models/book");
const { Log } = require("../../models/log");

exports.Book = {
  getAll: () => new Promise((resolve, reject) => {
    Book.find().exec((error, books) => {
      if (error) reject(error);
      resolve(books);
    });
  }),
  getAvailable: () => new Promise((resolve, reject) => {
    Book.find({
      user: null,
      taken_by: { $exists: false },
      is_archived: false
    }).populate("category").exec((error, books) => {
      if (error) reject(error);
      resolve(books);
    });
  }),
  getUnavailable: () => new Promise((resolve, reject) => {
    Book.find({
      $or: [
        { user: { $ne: null } },
        { taken_by: { $exists: true } }
      ],
      is_archived: false
    }).populate("user").exec((error, books) => {
      if (error) reject(error);
      resolve(books);
    });
  }),
  getByQuery: (query) => new Promise((resolve, reject) => {
    Book.find({
      $text: { $search: query },
      is_archived: false
    }).populate("category").exec((error, books) => {
      if (error) reject(error);
      resolve(books);
    });
  }),
  getByUser: (userId) => new Promise((resolve, reject) => {
    Book.find({ user: userId }).populate("category").exec((error, books) => {
      if (error) reject(error);
      resolve(books);
    });
  }),
  getByCategory: (categoryId) => new Promise((resolve, reject) => {
    Book.find({ category: categoryId }).exec((error, books) => {
      if (error) reject(error);
      resolve(books);
    });
  }),
  isExists: (author, name) => new Promise((resolve, reject) => {
    Book.findOne({ author, name }).exec((error, book) => {
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
  changeUser: async (bookId, userId) => {
    let book;
    let errorMessage;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      book = await Book.findByIdAndUpdate(bookId, { $set: { user: userId } });
      await Log.create({ book: bookId, user: userId });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      errorMessage = error;
    } finally {
      session.endSession();
    }
    return new Promise((resolve, reject) => {
      if (errorMessage) reject(errorMessage);
      resolve(book);
    });
  },
  clearUser: async (bookId) => {
    let book;
    let errorMessage;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      book = await Book.findByIdAndUpdate(
        bookId,
        { $set: { user: null } }
      );
      await Log.findOneAndUpdate(
        { book: bookId, user: book.user },
        { $set: { returned: Date.now() } }
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      errorMessage = error;
    } finally {
      session.endSession();
    }
    return new Promise((resolve, reject) => {
      if (errorMessage) reject(errorMessage);
      resolve(book);
    });
  },
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
