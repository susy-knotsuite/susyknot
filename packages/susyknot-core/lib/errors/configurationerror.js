var SusyknotError = require("susyknot-error");
var inherits = require("util").inherits;

inherits(ConfigurationError, SusyknotError);

function ConfigurationError(message) {
    ConfigurationError.super_.call(this, message);
}

module.exports = ConfigurationError;
