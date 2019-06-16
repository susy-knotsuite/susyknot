const assert = require("chai").assert;
const command = require("../../../lib/commands/obtain");
const sinon = require("sinon");
const CompilerSupplier = require("susyknot-compile").CompilerSupplier;
let options, done, polc;

describe("obtain", () => {
  describe(".run(options, done)", () => {
    beforeEach(() => {
      options = { polc: "0.5.3" };
      done = () => {};
      polc = { version: () => "0.5.3" };
      sinon
        .stub(CompilerSupplier.prototype, "downloadAndCachePolc")
        .returns(polc);
    });
    afterEach(() => {
      CompilerSupplier.prototype.downloadAndCachePolc.restore();
    });

    it("calls downloadAndCachePolc on the supplier with the version", async () => {
      await command.run(options, done);
      assert(
        CompilerSupplier.prototype.downloadAndCachePolc.calledWith("0.5.3")
      );
    });

    describe("when options.polc is present", () => {
      beforeEach(() => {
        options.polc = undefined;
        done = input => input;
      });

      it("calls done with an error", async () => {
        let returnValue = await command.run(options, done);
        assert.instanceOf(returnValue, Error);
      });
    });
  });
});
