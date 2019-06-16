var SusyknotError = require("susyknot-error");
var inherits = require("util").inherits;

inherits(TaskError, SusyknotError);

function TaskError(message) {
  TaskError.super_.call(this, message);
};

module.exports = TaskError;
