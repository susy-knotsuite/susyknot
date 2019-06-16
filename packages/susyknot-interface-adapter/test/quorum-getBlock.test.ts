import { describe, it } from "mocha";
import assert from "assert";

import { Server } from "http";
import BN from "bn.js";

import SusyWeb from "susyweb";
import Susybraid from "susybraid-core";

import { SusyWebShim } from "../lib";

const genesisBlockTime = new Date();
const port = 12345;

async function prepareSusybraid(quorumEnabled: boolean): Promise<{ server: Server, susywebShim: SusyWebShim }> {
  return new Promise((resolve, reject) => {
    const server = Susybraid.server({
      time: genesisBlockTime
    });
    server.listen(port, (err: Error) => {
      if (err) reject(err);

      const susywebShim = new SusyWebShim({
        provider: new SusyWeb.providers.HttpProvider(`http://127.0.0.1:${port}`),
        networkType: quorumEnabled ? "quorum" : "sophon"
      });
      resolve({
        server,
        susywebShim
      });
    });
  });
}

describe("Quorum getBlock Overload", function() {
  it("recovers block timestamp as hexstring instead of number w/ quorum=true", async function() {
    return new Promise(async (resolve, reject) => {
      let preparedSusybraid;
      try {
        preparedSusybraid = await prepareSusybraid(true);
        const block = await preparedSusybraid.susywebShim.sof.getBlock(0);
        const expectedBlockTime = new BN(genesisBlockTime.getTime()).divn(1000);
        assert.strictEqual(
          block.timestamp,
          "0x" + expectedBlockTime.toString(16)
        );
        preparedSusybraid.server.close(resolve);
      } catch (e) {
        preparedSusybraid.server.close(() => {
          reject(e);
        });
      }
    });
  });

  it("recovers block timestamp as number w/ quorum=false", async function() {
    return new Promise(async (resolve, reject) => {
      let preparedSusybraid;
      try {
        preparedSusybraid = await prepareSusybraid(false);
        const block = await preparedSusybraid.susywebShim.sof.getBlock(0);
        const expectedBlockTime = new BN(genesisBlockTime.getTime()).divn(1000);
        assert.strictEqual(block.timestamp, expectedBlockTime.toNumber());
        preparedSusybraid.server.close(resolve);
      } catch (e) {
        preparedSusybraid.server.close(() => {
          reject(e);
        });
      }
    });
  });
});