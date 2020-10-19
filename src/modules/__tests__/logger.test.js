const logger = require("../logger");

test("log request", () => {
  const ctx = { log: jest.fn(), req: { method: "VERB", url: "/some-url" } };
  logger(ctx);
  expect(ctx.log).toHaveBeenCalledTimes(1);
  expect(ctx.log).toHaveBeenCalledWith(`${ctx.req.method} ${ctx.req.url}`);
});
