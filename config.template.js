console.log(`process.env.NODE_ENV: ${process.env.NODE_ENV}`);

let overwriteConfig;

switch (process.env.NODE_ENV) {
  case "test":
    overwriteConfig = require("./config.test");
    break;
  case "production":
    overwriteConfig = require("./config.prod");
    break;
  default:
    break;
}

module.exports = {
  token: "",
  useProxy: false,
  proxy: {
    host: "127.0.0.1",
    port: 9150,
    username: "",
    password: ""
  },
  mongoUrl: "mongodb://localhost/library_bot",
  defaultAdmin: {
    telegram_id: "",
    username: "",
    role: ""
  },
  ...overwriteConfig
};
