module.exports = ctx => {
  const { res } = ctx;
  res.setHeader("Expires", "Sat, 01 Jan 2000 00:00:00 GMT");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("Cache-Control", "post-check=0, pre-check=0");
  res.setHeader("Pragma", "no-cache");
};
