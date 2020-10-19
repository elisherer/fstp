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
    this.name = "HttpError";
    this.statusCode = statusCode;
  }

  process(res) {
    res.statusCode = this.statusCode;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: this.message || DefaultMessages[this.statusCode] }));
  }
}

module.exports = HTTPResponseError;
