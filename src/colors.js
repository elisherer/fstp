const ESC = "[",
  END = ESC + "39m";
module.exports.red = value => ESC + "31m" + value + END;
module.exports.green = value => ESC + "32m" + value + END;
module.exports.yellow = value => ESC + "33m" + value + END;
module.exports.blue = value => ESC + "34m" + value + END;
module.exports.magenta = value => ESC + "35m" + value + END;
module.exports.cyan = value => ESC + "36m" + value + END;
module.exports.grey = value => ESC + "90m" + value + END;
