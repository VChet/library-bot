const mongoose = require("mongoose");

const { initCollections } = require("./models/init");

function connectToDB() {
  mongoose.connect(process.env.MONGO_URL, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  initCollections();

  mongoose.connection.on("error", console.error.bind(console, "MongoDB connection error:"));
}

module.exports = { connectToDB };
