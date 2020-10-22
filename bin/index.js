#!/usr/bin/env node
const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

/** @type FstpOptions */
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
  .option("cors", {
    alias: "c",
    default: true,
    type: "boolean",
    description: "Whether to allow CORS"
  })
  .option("auth", {
    alias: "a",
    default: "bearer",
    choices: ["none", "bearer", "basic"],
    description:
      "Authentication scheme. For basic, provide --user with username:password string. For bearer, either provide --token or one will be generated randomly on startup."
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
      "Specify a token for bearer authentication (if not specified, a random token will be generated)"
  })
  .option("user", {
    alias: "u",
    type: "string",
    description: "Specify a username and password for basic authentication (i.e. alice:Passw0rd)"
  })
  .help().argv;
argv.path = argv.path ? path.resolve(argv.path) : process.cwd();

require("../src/server.js")(argv);
