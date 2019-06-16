import BN from "bn.js";
import SusyWeb from "susyweb";

// The ts-ignores are ignoring the checks that are
// saying that susyweb.sof.getBlock is a function and doesn't
// have a `method` property, which it does

export function getBlock(susyweb: SusyWeb) {
  // @ts-ignore
  const _oldFormatter = susyweb.sof.getBlock.method.outputFormatter;

  // @ts-ignore
  susyweb.sof.getBlock.method.outputFormatter = block => {
    // @ts-ignore
    let result = _oldFormatter.call(susyweb.sof.getBlock.method, block);

    // Perhaps there is a better method of doing this,
    // but the raw hexstrings work for the time being
    result.gasLimit = "0x" + new BN(result.gasLimit).toString(16);
    result.gasUsed = "0x" + new BN(result.gasUsed).toString(16);

    return result;
  };
};

export function getTransaction(susyweb: SusyWeb) {
  const _oldTransactionFormatter =
    // @ts-ignore
    susyweb.sof.getTransaction.method.outputFormatter;

  // @ts-ignore
  susyweb.sof.getTransaction.method.outputFormatter = tx => {
    let result = _oldTransactionFormatter.call(
      // @ts-ignore
      susyweb.sof.getTransaction.method,
      tx
    );

    // Perhaps there is a better method of doing this,
    // but the raw hexstrings work for the time being
    result.gas = "0x" + new BN(result.gas).toString(16);

    return result;
  };
};

export function getTransactionReceipt(susyweb: SusyWeb) {
  const _oldTransactionReceiptFormatter =
    // @ts-ignore
    susyweb.sof.getTransactionReceipt.method.outputFormatter;

  // @ts-ignore
  susyweb.sof.getTransactionReceipt.method.outputFormatter = receipt => {
    let result = _oldTransactionReceiptFormatter.call(
      // @ts-ignore
      susyweb.sof.getTransactionReceipt.method,
      receipt
    );

    // Perhaps there is a better method of doing this,
    // but the raw hexstrings work for the time being
    result.gasUsed = "0x" + new BN(result.gasUsed).toString(16);

    return result;
  };
};