const { HTTPUnauthorizedError } = require("../HTTPResponseError");

module.exports = ctx => {
  const { req, res, token, options } = ctx;
  switch (options.auth) {
    case "basic":
      if (req.headers.authorization !== `Basic ${token}`) {
        res.setHeader("WWW-Authenticate", 'Basic realm="Access is restricted", charset="UTF-8"');
        throw new HTTPUnauthorizedError();
      }
      break;
    case "bearer":
      if (req.headers.authorization !== `Bearer ${token}`) {
        throw new HTTPUnauthorizedError();
      }
      break;
    // default "none":
  }
};
