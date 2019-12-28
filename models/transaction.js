const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  book: {
    type: Schema.Types.ObjectId,
    ref: "Book"
  },
  date_taken: {
    type: Date
  },
  date_returned: {
    type: Date
  }
});

exports.Transaction = mongoose.model("Transaction", schema);
