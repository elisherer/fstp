const auth = require("../auth");
const { HTTPUnauthorizedError } = require("../../HTTPResponseError");

test("success - bearer", () => {
  const ctx = {
    token: "1234",
    req: { headers: { authorization: "Bearer 1234" } },
    options: { auth: "bearer" }
  };
  expect(() => auth(ctx)).not.toThrow();
});

test("fail - no bearer", () => {
  const ctx = {
    token: "1234",
    req: { headers: { authorization: "1234" } },
    options: { auth: "bearer" }
  };
  expect(() => auth(ctx)).toThrow(HTTPUnauthorizedError);
});

test("fail - no token", () => {
  const ctx = { token: "1234", req: { headers: {} }, options: { auth: "bearer" } };
  expect(() => auth(ctx)).toThrow(HTTPUnauthorizedError);
});

test("fail - basic", () => {
  const ctx = {
    token: "1234",
    req: { headers: {} },
    res: { setHeader: jest.fn() },
    options: { auth: "basic" }
  };
  expect(() => {
    try {
      auth(ctx);
    } catch (e) {
      expect(ctx.res.setHeader).toBeCalledTimes(1);
      expect(ctx.res.setHeader).toBeCalledWith(
        "WWW-Authenticate",
        expect.stringContaining("Basic ")
      );
      throw e;
    }
  }).toThrow(HTTPUnauthorizedError);
});

test("success - basic", () => {
  const ctx = {
    token: "1234",
    req: { headers: { authorization: "Basic 1234" } },
    options: { auth: "basic" }
  };
  expect(() => auth(ctx)).not.toThrow();
});
