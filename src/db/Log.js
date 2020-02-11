const { Log } = require("../../models/log");

exports.Log = {
  getByBook: (book) => new Promise((resolve, reject) => {
    Log.find({ book })
      .limit(5)
      .populate("user")
      .populate("book")
      .exec((error, logs) => {
        if (error) reject(error);
        resolve(logs);
      });
  }),
  getByUser: (user) => new Promise((resolve, reject) => {
    Log.find({ user })
      .limit(5)
      .populate("user")
      .populate("book")
      .exec((error, logs) => {
        if (error) reject(error);
        resolve(logs);
      });
  }),
};
