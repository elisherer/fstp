module.exports = ctx => {
  const { req, pathname, url, log } = ctx;
  log(`${req.method} ${pathname}${url.search || ""}`);
};
