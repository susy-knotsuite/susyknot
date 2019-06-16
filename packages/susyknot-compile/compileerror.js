var colors = require("colors");
var SusyknotError = require("susyknot-error");
var inherits = require("util").inherits;

inherits(CompileError, SusyknotError);

function CompileError(message) {
  // Note we trim() because polc likes to add extra whitespace.
  var fancy_message =
    message.trim() + "\n\n" + colors.red("Compilation failed. See above.");
  var normal_message = message.trim();

  CompileError.super_.call(this, normal_message);
  this.message = fancy_message;
}

module.exports = CompileError;
