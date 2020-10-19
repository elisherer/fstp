const crypto = require("crypto");
const http = require("http");
const { blue, green, red } = require("./colors");
const HTTPResponseError = require("./HTTPResponseError");

const logger = require("./modules/logger");
const cors = require("./modules/cors");
const auth = require("./modules/auth");
const _static = require("./modules/static");
const nocache = require("./modules/nocache");
const crudfs = require("./modules/crudfs");

/**
 *
 * @param options {CrudfsOptions}
 */
const createFileServer = options => {
  const token = options.token || crypto.randomBytes(16).toString("hex");

  http
    .createServer((req, res) => {
      try {
        const log = options.verbose ? (...args) => console.log(...args) : () => {};
        const url = new URL(req.url, `http://${req.headers.host}`);
        const ctx = { req, res, options, token, log, url };
        if (options.verbose) logger(ctx);
        if (options.cors) cors(ctx);
        if (!options.public) auth(ctx);
        if (_static(ctx)) return;
        nocache(ctx);
        crudfs(ctx);
      } catch (e) {
        if (e instanceof HTTPResponseError) {
          return e.process(res);
        }
        console.error(e);
        return new HTTPResponseError(500).process(res);
      }
    })
    .listen(options.port, options.host, () => {
      let listenMessage = `\nServer is listening on ${green(options.host + ":" + options.port)}`;
      listenMessage += `, serving folder ${blue(options.path)}.`;
      if (!options.public) {
        listenMessage += `\nUse this token for authentication: ${red(token)}`;
      }
      console.log(listenMessage);
    });
};

module.exports = createFileServer;
