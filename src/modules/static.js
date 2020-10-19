const favicon = Buffer.from(
  "AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEAB" +
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACAAAAAgIAAgAAAAIAAgACAgAAAwMDAAICAgAAAAP8AAP8AAAD//wD/" +
    "AAAA/wD/AP//AAD///8A//////////////////////////////////+f/5mZ/////5////mf////mZn5mf////+f/5mZn////5mZ+Zmf" +
    "////////////+Z+f+fmZ+Z+f/5/5+fn5+Z//mZ/5+fn5mf+f+fn5+fn5mZmf+fn5n////////////////////////wAA//8AAP//" +
    "AAD3HwAA9+8AAPGfAAD3fwAA8Y8AAP//AACWiQAAdqoAAHGqAAB2qgAAkakAAP//AAD//wAA",
  "base64"
);

module.exports = ctx => {
  const { req, res, url } = ctx;

  if (req.method === "GET" && url.pathname === "/favicon.ico") {
    res.setHeader("Content-Type", "image/x-icon");
    res.end(favicon);
    return true;
  }
};
