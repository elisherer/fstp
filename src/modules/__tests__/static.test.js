const _static = require("../static");

const getFaviconCtx = () => ({
  req: { method: "GET" },
  url: { pathname: "/favicon.ico" },
  res: { setHeader: jest.fn(), end: jest.fn() }
});

test("serve favicon", () => {
  const ctx = getFaviconCtx();
  _static(ctx);
  expect(ctx.res.setHeader).toHaveBeenCalledTimes(1);
  expect(ctx.res.setHeader).toHaveBeenCalledWith("Content-Type", "image/x-icon");
  expect(ctx.res.end).toHaveBeenCalledTimes(1);
  expect(ctx.res.end).toHaveBeenCalledWith(expect.any(Buffer));
});

test("not serve favicon", () => {
  let ctx = getFaviconCtx(); //clone
  ctx.url.pathname = "favicon.ico"; // missing slash
  _static(ctx);
  expect(ctx.res.setHeader).not.toHaveBeenCalled();
  expect(ctx.res.end).not.toHaveBeenCalled();

  ctx = getFaviconCtx(); //clone
  ctx.req.method = "POST"; // not GET
  _static(ctx);
  expect(ctx.res.setHeader).not.toHaveBeenCalled();
  expect(ctx.res.end).not.toHaveBeenCalled();
});
