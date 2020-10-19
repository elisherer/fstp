module.exports = ctx => {
  const { req } = ctx;
  console.log(`${req.method} ${req.url}`);
};
