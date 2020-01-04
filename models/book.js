const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  author: {
    type: String,
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category"
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  is_archived: {
    type: Boolean,
    default: false
  }
});

schema.index({ name: "text", author: "text" }, { default_language: "ru" });
exports.Book = mongoose.model("Book", schema);
