const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { removeBreaks } = require("../src/helpers");

const schema = new Schema({
  name: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  category: {
    type: String
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

schema.pre("save", function(next) {
  this.name = removeBreaks(this.name);
  this.author = removeBreaks(this.author);
  next();
});

// Check combination of name and author fields to be unique
schema.index({ "name": 1, "author": 1 }, { "unique": true });
// Indexate name and author fields for search
schema.index({ name: "text", author: "text" }, { default_language: "ru" });
exports.Book = mongoose.model("Book", schema);
