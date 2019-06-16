const colors = require("colors");
const SusyknotError = require("susyknot-error");
const inherits = require("util").inherits;

inherits(BuildError, SusyknotError);

function BuildError(message) {
  message = "Error building:\n\n" + message + "\n\n" + colors.red("Build failed. See above.");
  BuildError.super_.call(this, message);
}

module.exports = BuildError;
