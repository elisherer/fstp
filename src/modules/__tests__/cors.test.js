const cors = require("../cors");

test("set headers", () => {
  const ctx = { res: { setHeader: jest.fn() } };
  cors(ctx);
  expect(ctx.res.setHeader).toHaveBeenCalledTimes(3);
  expect(ctx.res.setHeader).toHaveBeenCalledWith(
    expect.stringMatching(/^Access-Control-Allow-[A-Z][a-z]+$/),
    expect.any(String)
  );
});
