const { blue, green, cyan, grey, magenta, red, yellow } = require("../colors");

test("wrapped correctly", () => {
  const value = "Hello World",
    matcher = /^\[[39][0-6]mHello World\[39m$/;
  expect(blue(value)).toMatch(matcher);
  expect(green(value)).toMatch(matcher);
  expect(cyan(value)).toMatch(matcher);
  expect(grey(value)).toMatch(matcher);
  expect(magenta(value)).toMatch(matcher);
  expect(red(value)).toMatch(matcher);
  expect(yellow(value)).toMatch(matcher);
});
