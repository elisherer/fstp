const DefaultMessages = {
  [400]: "Bad Request",
  [401]: "Unauthorized",
  [403]: "Forbidden",
  [404]: "Not Found",
  [405]: "Method Not Allowed",
  [500]: "Internal Server Error"
};

class HTTPResponseError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "HTTPResponseError";
    this.statusCode = statusCode;
  }

  process(res) {
    const error = this.message || DefaultMessages[this.statusCode];
    if (HTTPResponseError.log)
      HTTPResponseError.log(`> Processing error ${this.statusCode} ${DefaultMessages[this.statusCode] || ""} - ${error}`)
    res.statusCode = this.statusCode;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error }));
  }
}

class HTTPUnauthorizedError extends HTTPResponseError {
  constructor() {
    super(401, "");
    this.name = "HTTPUnauthorizedError";
  }
}

exports.HTTPResponseError = HTTPResponseError;
exports.HTTPUnauthorizedError = HTTPUnauthorizedError;
