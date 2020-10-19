#!/usr/bin/env node
const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

/** @type CrudfsOptions */
const argv = yargs(hideBin(process.argv))
  .usage("$0 [path]", "Run the server")
  .option("port", {
    alias: "p",
    default: 8210,
    type: "number",
    description: "Port to listen on"
  })
  .option("host", {
    alias: "h",
    default: "127.0.0.1",
    type: "string",
    description: "Host to listen on"
  })
  .option("readonly", {
    alias: "r",
    default: false,
    type: "boolean",
    description: "Read only file system (allow only GET operations)"
  })
  .option("verbose", {
    alias: "v",
    default: false,
    type: "boolean",
    description: "Verbose logging"
  })
  .option("prefix", {
    alias: "f",
    default: "",
    type: "string",
    description: "Path prefix (e.g. /some-route)"
  })
  .option("public", {
    alias: "u",
    default: false,
    type: "boolean",
    description: "Toggle authorization requirement"
  })
  .option("hidden", {
    alias: "d",
    default: false,
    type: "boolean",
    description: "Allow hidden files"
  })
  .option("token", {
    alias: "t",
    type: "string",
    description:
      "Specify a token for authentication (if not specified, a random token will be generated)"
  })
  .help().argv;
argv.path = argv.path ? path.resolve(argv.path) : process.cwd();

require("../src/server.js")(argv);
