const fs = require("fs");
const path = require("path");
const mime = require("mime");
const { HTTPResponseError } = require("../HTTPResponseError");

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Index of {{path}}</title>
  <meta name="viewport" content="width=device-width">
  <style>
  td:not(:first-of-type), th:not(:first-of-type) { padding-left: 8px; min-width: 100px; text-align: left; }
  td:nth-of-type(4), th:nth-of-type(4) { text-align: right; }
  </style>
</head>
<body>
<h1>Index of {{path}}</h1>
<table>
<thead>
  <tr>
    <th valign="top">&nbsp;</th>
    <th>Name</th>
    <th>Last modified</th>
    <th>Size</th>
    <th>Type</th>
  </tr>
</thead>
<tbody>
  <tr><td colspan="5"><hr></td></tr>
  {{body}}  
  <tr><td colspan="5"><hr></td></tr>
  <tr><td colspan="5">crudfs © ${new Date().getFullYear()}</td></tr>
</tbody>
</table>
</body>
</html>`;

module.exports = ctx => {
  const { req, res, url, options, log } = ctx;

  if (options.readonly && req.method !== "GET") {
    throw new HTTPResponseError(405, "File system is read-only");
  }

  if (!url.pathname.startsWith(options.prefix)) {
    throw new HTTPResponseError(404);
  }

  let relativePathname = url.pathname.substr(options.prefix.length);
  const filePath = path.join(options.path, relativePathname);
  if (!filePath.startsWith(options.path)) {
    throw new HTTPResponseError(403, "Path traversal is not allowed");
  }

  if (!options.hidden && /\/\.[^.\\]/.test(url.pathname)) {
    // no hidden files / folders (unless allowed)
    throw new HTTPResponseError(403, "No access to forbidden paths");
  }

  const stats = fs.existsSync(filePath) && fs.lstatSync(filePath);
  if (stats && !stats.isFile() && !stats.isDirectory()) {
    // not allowing access for non-files/directories
    throw new HTTPResponseError(403, "Only files and directories access is allowed");
  }
  if (stats && stats.isDirectory() && !relativePathname.endsWith("/")) {
    relativePathname += "/";
  }

  switch (req.method) {
    case "GET": // get folder list, file content
      if (stats.isFile()) {
        log("> Reading file: " + filePath);
        res.setHeader("Content-Type", mime.getType(filePath));
        res.setHeader("Content-Length", stats.size);
        res.setHeader("Last-Modified", stats.mtime);
        res.end(fs.readFileSync(filePath));
      } else {
        log("> Reading directory: " + filePath);
        const files = fs
          .readdirSync(filePath)
          .filter(f => options.hidden || f[0] !== ".")
          .map(f => {
            const fp = path.join(filePath, f);
            const fileStats = fs.statSync(fp);
            return {
              name: f,
              dir: fileStats.isDirectory(),
              size: fileStats.size,
              mtime: fileStats.mtime,
              mime: mime.getType(fp)
            };
          })
          .sort((a, b) => b.dir - a.dir || a.name.localeCompare(b.name));
        if (req.headers.accept.includes("application/json")) {
          res.setHeader("Content-Type", "application/json");
          res.write(JSON.stringify(files));
          res.end();
        } else {
          // not requesting json
          res.setHeader("Content-Type", "text/html");
          let html = HTML_TEMPLATE.replace(/\{\{path}}/g, relativePathname);
          let body =
            relativePathname === "/"
              ? ""
              : `<tr><td>📁</td><td><a href="${
                  relativePathname.split("/").slice(0, -2).join("/") || "/"
                }">..</a></td></tr>`;
          for (let f = 0; f < files.length; f++) {
            let file = files[f];
            file.name = file.name
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;");
            body += `<tr>
    <td>${file.dir ? "📁" : "📄"}</td>
    <td><a href=".${relativePathname}${file.name}"><span>${file.name}</span></a></td>
    <td>${file.mtime.toISOString()}</td><td>${file.size}</td><td>${file.mime || ""}</td>
</tr>
`;
          }
          res.end(html.replace("{{body}}", body));
        }
      }
      break;

    case "POST": // create dir
      log("> Creating path: " + filePath);
      fs.mkdirSync(filePath, 0o777);
      break;

    case "PUT": // create / update file
      log("> Writing file: " + filePath);
      const stream = fs.createWriteStream(filePath);
      req.pipe(stream); // TODO: limit data length?
      stream.on("end", function () {
        res.statusCode = 204;
        res.end();
      });
      stream.on("error", err => {
        throw err;
      });
      return;

    case "PATCH": // rename / move
      if (!url.searchParams.to) {
        throw new HTTPResponseError(400, "'to' query parameter is required.");
      }
      log(`> Renaming: ${filePath} (to ${url.searchParams.to})`);
      const newPath = path.join(options.path, url.searchParams.to);
      if (!newPath.startsWith(options.path)) {
        throw new HTTPResponseError(403, "Path traversal is not allowed");
      }
      fs.renameSync(filePath, newPath);
      break;

    case "DELETE": // delete file / dir
      if (!stats && !fs.existsSync(filePath)) {
        throw new HTTPResponseError(404);
      }
      if (stats.isFile()) {
        log("> Deleting file: " + filePath);
        fs.unlinkSync(filePath);
      } else {
        log("> Deleting directory: " + filePath);
        fs.rmdirSync(filePath);
      }
      break;

    default:
      throw new HTTPResponseError(405);
  }
  res.statusCode = 204;
  res.end();
};
