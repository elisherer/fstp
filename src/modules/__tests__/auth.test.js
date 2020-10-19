const auth = require("../auth");
const { HTTPUnauthorizedError } = require("../../HTTPResponseError");

test("success", () => {
  const ctx = { token: "1234", req: { headers: { authorization: "Bearer 1234" } } };
  expect(() => auth(ctx)).not.toThrow();
});

test("fail - no bearer", () => {
  const ctx = { token: "1234", req: { headers: { authorization: "1234" } } };
  expect(() => auth(ctx)).toThrow(HTTPUnauthorizedError);
});

test("fail - no token", () => {
  const ctx = { token: "1234", req: { headers: {} } };
  expect(() => auth(ctx)).toThrow(HTTPUnauthorizedError);
});
