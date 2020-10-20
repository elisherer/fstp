const cors = require("../cors");

test("set headers", () => {
  const ctx = { req: {}, res: { setHeader: jest.fn() } };
  cors(ctx);
  expect(ctx.res.setHeader).toHaveBeenCalledTimes(3);
  expect(ctx.res.setHeader).toHaveBeenCalledWith(
    expect.stringMatching(/^Access-Control-Allow-[A-Z][a-z]+$/),
    expect.any(String)
  );
});

test("answer options", () => {
  const ctx = { req: { method: 'OPTIONS' }, res: { setHeader: jest.fn(), end: jest.fn() } };
  cors(ctx);
  expect(ctx.res.setHeader).toHaveBeenCalledTimes(3);
  expect(ctx.res.setHeader).toHaveBeenCalledWith(
    expect.stringMatching(/^Access-Control-Allow-[A-Z][a-z]+$/),
    expect.any(String)
  );
  expect(ctx.res.statusCode).toBe(200);
  expect(ctx.res.end).toHaveBeenCalledTimes(1);
  expect(ctx.res.end).toHaveBeenCalledWith();
});
