const mongoose = require("mongoose");
const dayjs = require("dayjs");

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

schema.virtual("dates").get(function getDates() {
  const format = (date) => dayjs(date).format("DD.MM.YYYY");
  let dates = `${format(this.taken)} - `;
  dates += this.returned ?
    format(this.returned) :
    "на руках";
  return dates;
});

exports.Log = mongoose.model("Log", schema);
