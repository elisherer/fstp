module.exports = ctx => {
  const { req, log } = ctx;
  log(`${req.method} ${req.url}`);
};
