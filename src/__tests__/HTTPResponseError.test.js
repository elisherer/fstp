const { HTTPResponseError, HTTPUnauthorizedError } = require("../HTTPResponseError");

test("error inheritence", () => {
  const hre = new HTTPResponseError();
  expect(hre).toBeInstanceOf(Error);
});

test("process - with default message", () => {
  const hre = new HTTPResponseError(403);
  const res = {
    setHeader: jest.fn(),
    end: jest.fn()
  };
  hre.process(res);
  expect(res.setHeader).toHaveBeenCalledTimes(1);
  expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/json");
  expect(res.end).toHaveBeenCalledTimes(1);
  expect(res.end).toHaveBeenCalledWith(expect.stringContaining("Forbidden"));
});

test("unauthorized", () => {
  const hue = new HTTPUnauthorizedError();
  expect(hue).toBeInstanceOf(HTTPResponseError);
  expect(hue.statusCode).toBe(401);
  expect(hue.message).toBe("");
});
