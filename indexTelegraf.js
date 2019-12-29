const mongoose = require("mongoose");

const config = require("./config");
const { initCollections } = require("./models/init");
const { startBot } = require("./src/bot");

mongoose.connect(config.mongoUrl, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  initCollections();
  startBot();
});

mongoose.connection.on("error", console.error.bind(console, "MongoDB connection error:"));
