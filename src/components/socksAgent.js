const Agent = require("socks5-https-client/lib/Agent");

exports.socksAgent = new Agent({
  socksHost: process.env.PROXY_HOST,
  socksPort: Number(process.env.PROXY_PORT),
  socksUsername: process.env.PROXY_USERNAME,
  socksPassword: process.env.PROXY_PASSWORD,
});
