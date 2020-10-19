const mockfs = require("mock-fs");
const crudfs = require("../crudfs");
const { HTTPResponseError } = require("../../HTTPResponseError");

beforeEach(async () => {
  // Creates an in-memory file system
  mockfs({
    "/test": {
      "note.md": "hello world!"
    }
  });
});

afterEach(async () => {
  mockfs.restore();
});

const getContext = (obj = {}) =>
  Object.assign(
    {
      req: Object.assign({ method: "GET" }, obj.req),
      res: Object.assign({ setHeader: jest.fn(), end: jest.fn() }, obj.res),
      url: new URL("http://127.0.0.1:8210/dir/file.txt"),
      options: Object.assign({}, obj.options),
      log: jest.fn()
    },
    obj
  );

test("fail on readonly", () => {
  const ctx = getContext({ req: { method: "POST" }, options: { readonly: true } });
  expect(() => crudfs(ctx)).toThrow("File system is read-only");
});
