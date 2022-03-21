const packageJSON = require('../package.json');
const crypto = require("crypto");
const http = require("http");
const { blue, green, red } = require("./colors");
const { HTTPResponseError } = require("./HTTPResponseError");

const logger = require("./modules/logger");
const cors = require("./modules/cors");
const auth = require("./modules/auth");
const _static = require("./modules/static");
const nocache = require("./modules/nocache");
const crud = require("./modules/crud");

/**
 *
 * @param options {FstpOptions}
 */
const createFileServer = options => {
  const token =
    options.auth === "bearer"
      ? options.token || crypto.randomBytes(16).toString("hex")
      : options.auth === "basic"
      ? Buffer.from(options.user, "utf8").toString("base64")
      : null;

  http
    .createServer((req, res) => {
      try {
        const log = options.verbose ? (...args) => console.log(...args) : () => {};
        HTTPResponseError.log = log;
        const url = new URL(req.url, `http://${req.headers.host}`);
        const ctx = {
          req,
          res,
          options,
          token,
          log,
          url,
          pathname: decodeURIComponent(url.pathname)
        };
        if (options.verbose) logger(ctx);
        if (options.cors && cors(ctx)) return;
        if (options.auth !== "none") auth(ctx);
        if (_static(ctx)) return;
        nocache(ctx);
        crud(ctx);
      } catch (e) {
        if (e instanceof HTTPResponseError) {
          return e.process(res);
        }
        console.error(e);
        return new HTTPResponseError(500).process(res);
      }
    })
    .listen(options.port, options.host, () => {
      let listenMessage = `\nFSTP Server (v${packageJSON.version}) is listening on ${green(options.host + ":" + options.port)}`;
      listenMessage += `, serving folder ${blue(options.path)}.`;
      if (options.auth === "bearer" && !options.token) {
        listenMessage += `\nUse this token for authentication: ${red(token)}`;
      }
      console.log(listenMessage);
    });
};

module.exports = createFileServer;
