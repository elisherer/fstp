const favicon = Buffer.from(
  "AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACAAAAA" +
  "gIAAgAAAAIAAgACAgAAAwMDAAICAgAAAAP8AAP8AAAD//wD/AAAA/wD/AP//AAD///8A//////////8AAAAAAAAAAAu7u7u7u7uwC7u7" +
  "u7u7u7ALu7u7u7u7sAu7u7u7u7uwC7u7u7u7u7ALu7u7u7u7sAu7u7u7u7uwC7u7u7u7u7ALu7u7u7u7sAu7uwAAAAAAC7u7D/////8A" +
  "AAD//////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAB/wAAg/8A" +
  "AP//AAD//wAA",
  "base64"
);

module.exports = ctx => {
  const { req, res, pathname } = ctx;

  if (req.method === "GET" && pathname === "/favicon.ico") {
    res.setHeader("Content-Type", "image/x-icon");
    res.end(favicon);
    return true;
  }
};
