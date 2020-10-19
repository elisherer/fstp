const HTTPResponseError = require('../HTTPResponseError');

module.exports = ctx => {
  const { req, token } = ctx;
  if (req.headers.authorization !== `Bearer ${token}`) {
    throw new HTTPResponseError(401);
  }
};