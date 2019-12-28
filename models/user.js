const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  telegram_id: {
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
    default: "User"
  },
  joined: {
    type: Date,
    default: Date.now
  }
});

exports.User = mongoose.model("User", schema);
