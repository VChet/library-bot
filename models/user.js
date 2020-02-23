const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  telegram_id: {
    type: String,
    required: true,
    unique: true
  },
  chat_id: {
    type: String,
    required: true,
    unique: true
  },
  first_name: {
    type: String
  },
  last_name: {
    type: String
  },
  username: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ["Admin", "User", "Guest"],
    default: "Guest"
  },
  joined: {
    type: Date,
    default: Date.now
  }
});

schema.virtual("full_name").get(function() {
  let fullname = this.first_name;
  if (this.last_name) fullname += " " + this.last_name;
  return fullname;
});

exports.User = mongoose.model("User", schema);
