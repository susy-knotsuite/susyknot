import debugModule from "debug";
const debug = debugModule("debugger:susyweb:adapter");

import SusyWeb from "susyweb";
import { promisify } from "util";

export default class SusyWebAdapter {
  constructor(provider) {
    this.susyweb = new SusyWeb(provider);
  }

  async getTrace(txHash) {
    let result = await promisify(this.susyweb.currentProvider.send)(
      //send *only* uses callbacks, so we use promsifiy to make things more
      //readable
      {
        jsonrpc: "2.0",
        method: "debug_traceTransaction",
        params: [txHash, {}],
        id: new Date().getTime()
      }
    );
    if (result.error) {
      throw new Error(result.error.message);
    } else {
      return result.result.structLogs;
    }
  }

  async getTransaction(txHash) {
    return await this.susyweb.sof.getTransaction(txHash);
  }

  async getReceipt(txHash) {
    return await this.susyweb.sof.getTransactionReceipt(txHash);
  }

  async getBlock(blockNumberOrHash) {
    return await this.susyweb.sof.getBlock(blockNumberOrHash);
  }

  /**
   * getDeployedCode - get the deployed code for an address from the client
   * NOTE: the block argument is optional
   * @param  {String} address
   * @return {String}         deployedBinary
   */
  async getDeployedCode(address, block) {
    debug("getting deployed code for %s", address);
    let code = await this.susyweb.sof.getCode(address, block);
    return code === "0x0" ? "0x" : code;
  }
}
