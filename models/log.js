const mongoose = require("mongoose");

const { Schema } = mongoose;

const schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  book: {
    type: Schema.Types.ObjectId,
    ref: "Book",
    required: true
  },
  taken: {
    type: Date,
    default: Date.now
  },
  returned: {
    type: Date
  }
});

exports.Log = mongoose.model("Log", schema);
