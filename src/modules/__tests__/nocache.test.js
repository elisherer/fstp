const nocache = require("../nocache");

test("set headers", () => {
  const ctx = { res: { setHeader: jest.fn() } };
  nocache(ctx);
  expect(ctx.res.setHeader).toHaveBeenCalledTimes(4);
  expect(ctx.res.setHeader).toHaveBeenCalledWith("Expires", expect.any(String));
  expect(ctx.res.setHeader).toHaveBeenCalledWith("Cache-Control", expect.any(String));
  expect(ctx.res.setHeader).toHaveBeenCalledWith("Pragma", "no-cache");
});
