const mongoose = require("mongoose");

const config = require("./config");
const { initCollections } = require("./models/init");

function connectToDB() {
  mongoose.connect(config.mongoUrl, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  initCollections();

  mongoose.connection.on("error", console.error.bind(console, "MongoDB connection error:"));
}

module.exports = { connectToDB };
