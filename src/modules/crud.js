const fs = require("fs");
const path = require("path");
const mime = require("mime");
const readLastLines = require('read-last-lines');
const { HTTPResponseError } = require("../HTTPResponseError");

const HTML_TEMPLATE = fs.readFileSync(path.join(__dirname, 'assets/listing.html'), 'utf8')
  .replace('{{year}}', new Date().getFullYear().toString());
const pdate = date => date.toISOString().replace(/[TZ]/g,' ');

module.exports = ctx => {
  const { req, res, url, pathname, options, log } = ctx;

  if (options.readonly && req.method !== "GET") {
    throw new HTTPResponseError(405, "File system is read-only");
  }

  if (!pathname.startsWith(options.prefix)) {
    throw new HTTPResponseError(404);
  }

  let relativePathname = pathname.substr(options.prefix.length);
  const filePath = path.resolve(path.join(options.path, relativePathname));
  if (!filePath.startsWith(options.path)) {
    throw new HTTPResponseError(403, "Path traversal is not allowed");
  }

  if (!options.hidden && /\/\.[^.\\]/.test(pathname)) {
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
    case "GET": { // get folder list, file content
      if (!stats && !fs.existsSync(filePath)) {
        throw new HTTPResponseError(404);
      }
      if (stats.isFile()) {
        const isTail = url.searchParams.has('tail');
        // check if "if-modified-since" header is present
        if (!isTail && req.headers["if-modified-since"]) {
          const ifModifiedSince = new Date(req.headers["if-modified-since"]);
          if (new Date(stats.mtime.toString()) - ifModifiedSince === 0) {
            log("> Sending not modified response");
            res.statusCode = 304;
            res.end();
            return;
          }
        }
        const tail = isTail && parseInt(url.searchParams.get('tail') || 10);
        log("> Reading file: " + filePath + (isTail ? ` (tail=${tail})` : ""));
        const contentType = mime.getType(filePath);
        res.setHeader("Content-Type", contentType);
        if (!isTail) {
          res.setHeader("Content-Length", stats.size);
          res.setHeader("Last-Modified", stats.mtime);
          res.end(fs.readFileSync(filePath));
        } else if (contentType && (contentType.startsWith("text") || contentType.startsWith('application'))) {
          return readLastLines.read(filePath, tail).then(lines => {
            res.end(lines);
          })
        }
        else { // tail not supported
          throw new HTTPResponseError(405, "Can't tail a binary file");
        }
      } else {
        log("> Reading directory: " + filePath);
        const files = fs
          .readdirSync(filePath)
          .filter(f => options.hidden || f[0] !== ".")
          .map(
            /** @returns {FscsFileDescriptor} */
            f => {
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
          res.write(JSON.stringify({result: files}, null, 2));
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
    <td><input type="radio" name="selection" value="${file.name}" /> ${file.dir ? "📁" : "📄"}</td>
    <td><a href="${relativePathname}${file.name}"><span>${file.name}</span></a></td>
    <td>${pdate(file.mtime)}</td><td>${file.dir ? "" : file.size}</td><td>${file.dir ? "" : file.mime || ""}</td>
</tr>
`;
          }
          res.end(html.replace("{{body}}", body));
        }
      }
      break;
    }
    case "POST": { // create dir
      log("> Creating path: " + filePath);
      fs.mkdirSync(filePath, {recursive: true});
      break;
    }
    case "PUT": { // create / update file
      log("> Writing file: " + filePath);
      const stream = fs.createWriteStream(filePath);
      let failed = false;
      stream.on("close", function () {
        if (!failed) {
          res.statusCode = 204;
          res.end();
        }
      });
      stream.on("error", err => {
        failed = true;
        console.error(err);
        new HTTPResponseError(500).process(res);
      });
      req.pipe(stream);
      return;
    }
    case "PATCH": {// rename / move
      if (!url.searchParams.has("to")) {
        throw new HTTPResponseError(400, "'to' query parameter is required.");
      }
      const to = url.searchParams.get("to");
      if (!stats && !fs.existsSync(filePath)) {
        throw new HTTPResponseError(404);
      }
      log(`> Renaming: ${filePath} (to ${to})`);
      const newPath = path.join(options.path, to);
      if (!newPath.startsWith(options.path)) {
        throw new HTTPResponseError(403, "Path traversal is not allowed");
      }
      fs.renameSync(filePath, newPath);
      break;
    }
    case "DELETE": { // delete file / dir
      if (!stats && !fs.existsSync(filePath)) {
        throw new HTTPResponseError(404);
      }
      if (stats.isFile()) {
        log("> Deleting file: " + filePath);
        fs.unlinkSync(filePath);
      } else {
        const isRecursive = url.searchParams.has("recursive");
        log("> Deleting directory: " + filePath + (isRecursive ? " (recursive)" : ""));
        if (isRecursive) {
          fs.rmdirSync(filePath, { recursive: true });
        } else {
          fs.rmdirSync(filePath);
        }
      }
      break;
    }
    default:
      throw new HTTPResponseError(405);
  }
  res.statusCode = 204;
  res.end();
};
