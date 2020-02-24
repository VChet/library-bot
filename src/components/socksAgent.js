const Agent = require("socks5-https-client/lib/Agent");

const config = require("../../config");

exports.socksAgent = new Agent({
  socksHost: config.proxy.host,
  socksPort: config.proxy.port,
  socksUsername: config.proxy.username,
  socksPassword: config.proxy.password,
});
