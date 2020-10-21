const logger = require("../logger");

test("log request", () => {
  const ctx = {
    log: jest.fn(),
    req: { method: "VERB" },
    pathname: "/ctx-pathname",
    url: { search: "?search=1" }
  };
  logger(ctx);
  expect(ctx.log).toHaveBeenCalledTimes(1);
  expect(ctx.log).toHaveBeenCalledWith(`${ctx.req.method} ${ctx.pathname}${ctx.url.search}`);
});
