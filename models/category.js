const mongoose = require("mongoose");

const { Schema } = mongoose;

const schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

exports.Category = mongoose.model("Category", schema);
