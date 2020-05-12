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
  userValidation: true,
  initDefaultBooks: false,
  defaultAdmin: {
    telegram_id: "",
    username: "",
    role: "Admin"
  }
};
