var SusyknotError = require("susyknot-error");
var inherits = require("util").inherits;
var utils = require("./utils");

inherits(StatusError, SusyknotError);

var defaultGas = 90000;

function StatusError(args, tx, receipt, reason) {
  var message;
  var gasLimit = args.gas || defaultGas;
  var reasonString = "";

  if (reason) reasonString = `Reason given: ${reason}.`;

  if (utils.bigNumberify(receipt.gasUsed).eq(utils.bigNumberify(gasLimit))) {
    message =
      "Transaction: " +
      tx +
      " exited with an error (status 0) after consuming all gas.\n" +
      "     Please check that the transaction:\n" +
      "     - satisfies all conditions set by Polynomial `assert` statements.\n" +
      "     - has enough gas to execute the full transaction.\n" +
      "     - does not trigger an invalid opcode by other means (ex: accessing an array out of bounds).";
  } else {
    message =
      `Transaction: ${tx} exited with an error (status 0). ${reasonString}\n` +
      "     Please check that the transaction:\n" +
      "     - satisfies all conditions set by Polynomial `require` statements.\n" +
      "     - does not trigger a Polynomial `revert` statement.\n";
  }

  StatusError.super_.call(this, message);
  this.tx = tx;
  this.receipt = receipt;
  this.reason = reason;
}

module.exports = StatusError;
