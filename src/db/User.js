const { User } = require("../../models/user");

exports.User = {
  getAll: () => new Promise((resolve, reject) => {
    User.find().lean().exec((error, users) => {
      if (error) reject(error);
      resolve(users);
    });
  }),
  getById: (userId) => new Promise((resolve, reject) => {
    User.findById(userId).lean().exec((error, user) => {
      if (error) reject(error);
      resolve(user);
    });
  }),
  isExists: (telegramId) => new Promise((resolve, reject) => {
    User.findOne({ telegram_id: telegramId }).lean().exec((error, user) => {
      if (error) reject(error);
      resolve(user);
    });
  }),
  changeData: (userData) => new Promise((resolve, reject) => {
    User.findOneAndUpdate(
      userData.telegram_id,
      { $set: userData },
      { new: true },
      (error, user) => {
        if (error) reject(error);
        resolve(user);
      });
  }),
  changeRole: (userId, role) => new Promise((resolve, reject) => {
    User.findOneAndUpdate(
      userId,
      { $set: { role } },
      { new: true },
      (error, user) => {
        if (error) reject(error);
        resolve(user);
      });
  }),
  addOne: (userData) => new Promise((resolve, reject) => {
    User.create(
      userData,
      (error, user) => {
        if (error) reject(error);
        resolve(user);
      }
    );
  })
};
