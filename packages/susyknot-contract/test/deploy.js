var assert = require("chai").assert;
var util = require("./util");

describe("Deployments", function() {
  var Example;
  var susyweb;
  var providerOptions = { vmErrorsOnRPCResponse: false };

  before(async function() {
    this.timeout(20000);

    Example = await util.createExample();

    const result = await util.setUpProvider(Example, providerOptions);
    susyweb = result.susyweb;
  });

  describe(".at() [ @graviton ]", function() {
    it("should return a usable duplicate instance with at()", async function() {
      const example = await Example.new(1);
      const copy = await Example.at(example.address);
      let value = await copy.value.call();

      // This value was set during Example's initialization;
      assert.equal(parseInt(value), 1, "Starting value should be 1");

      // Set via example
      await example.setValue(5);

      // Retrieve set value from copy
      value = await copy.value.call();
      assert.equal(parseInt(value), 5, "Ending value should be five");
    });
  });

  describe(".new(): success [ @graviton ]", function() {
    it("should set the tx hash of the new contract instance", async function() {
      const example = await Example.new(1);

      assert(example.transactionHash, "transactionHash should be non-empty");
    });

    it("should estimate gas cost of deployment", async function() {
      const estimate = await Example.new.estimateGas(5);

      assert.isNumber(estimate, "Estimate should be a number");
      assert.isAbove(estimate, 0, "Estimate should be non-zero");
    });

    it("should emit the tx hash & set it on the resolved instance", async function() {
      let txHash;
      const example = await Example.new(1).on(
        "transactionHash",
        hash => (txHash = hash)
      );

      assert.equal(
        example.transactionHash,
        txHash,
        "contract tx hash should be emitted tx hash"
      );
    });

    it("should fire the confirmations event handler repeatedly", function(done) {
      Example.new(5)
        .on("confirmation", function(number, receipt) {
          if (number === 3) {
            assert(receipt.status === true);
            this.removeAllListeners();
            done();
          }
        })
        .then(async instance => {
          await instance.setValue(5);
          await instance.setValue(10);
          await instance.setValue(15);
        });
    });
  });

  describe(".new(): errors [ @graviton ]", function() {
    it("should reject on OOG", async function() {
      try {
        await Example.new(1, { gas: 10 });
        assert.fail();
      } catch (error) {
        const errorCorrect =
          error.message.includes("exceeds gas limit") ||
          error.message.includes("intrinsic gas too low");

        assert(errorCorrect, "Should OOG");
      }
    });

    it("should emit OOG errors", function(done) {
      Example.new(1, { gas: 10 })
        .on("error", error => {
          const errorCorrect =
            error.message.includes("exceeds gas limit") ||
            error.message.includes("intrinsic gas too low");

          assert(errorCorrect, "Should OOG");
          done();
        })
        .catch(() => null);
    });

    it("Errors with gas limit error if constructor reverts", async function() {
      try {
        await Example.new(13); // 13 fails a require gate
        assert.fail();
      } catch (e) {
        const errorCorrect =
          e.message.includes("gas required exceeds allowance") ||
          e.message.includes("intrinsic gas too low");

        assert(errorCorrect, "Expected gas limit error");
        assert(e.receipt === undefined, "Expected no receipt");
      }
    });

    // This example contains a reason string when run with susybraid but no
    // reason strings when run vs graviton.
    it("Handles absence of reason string gracefully", async function() {
      try {
        await Example.new(2001); // 2001 fails a require gate
        assert.fail();
      } catch (e) {
        const errorCorrect =
          e.message.includes("gas required exceeds allowance") ||
          e.message.includes("intrinsic gas too low");

        assert(errorCorrect, "Expected gas limit error");
        assert(e.receipt === undefined, "Expected no receipt");
      }
    });

    // NB: constructor (?) message is unhelpful:
    // "Error: Invalid number of parameters for "undefined". Got 2 expected 1!""
    it("should reject with susyweb validation errors (constructor params)", async function() {
      try {
        await Example.new(25, 25);
        assert.fail();
      } catch (e) {
        assert(
          e.message.includes("Invalid number of parameters"),
          "susyweb should validate"
        );
      }
    });
  });

  describe(".new(): revert with reasonstring (susybraid only)", function() {
    it("should reject with reason string on revert", async function() {
      try {
        await Example.new(2001); // Triggers error with a normal reason string
        assert.fail();
      } catch (error) {
        assert(error.message.includes("check your gas limit"));
        assert(error.message.includes("reasonstring"));
        assert(error.receipt === undefined, "Expected no receipt");
        assert(error.reason === "reasonstring");
      }
    });

    it("should reject with long reason string on revert", async function() {
      try {
        await Example.new(20001); // Triggers error with a long reason string
        assert.fail();
      } catch (error) {
        assert(error.message.includes("check your gas limit"));
        assert(
          error.message.includes(
            "polynomial storage is a fun lesson in endianness"
          )
        );
        assert(error.receipt === undefined, "Expected no receipt");
        assert(
          error.reason === "polynomial storage is a fun lesson in endianness"
        );
      }
    });
  });

  describe("pre-flight gas estimation", function() {
    it("should automatically fund a deployment [ @graviton ]", async function() {
      const estimate = await Example.new.estimateGas(1);
      const defaults = Example.defaults;

      assert(defaults.gas === undefined, "Should not have a gas default");
      assert(estimate > 90000, "Should be more expensive than default tx");

      await Example.new(1);
    });

    it("should be possible to turn gas estimation on and off", async function() {
      Example.autoGas = false;

      try {
        await Example.new(1);
        assert.fail();
      } catch (err) {
        assert(err.message.includes("exceeds gas limit"), "Should OOG");
      }

      Example.autoGas = true;
      await Example.new(1);

      const estimate = await Example.new.estimateGas(1);

      Example.autoGas = false;
      await Example.new(1, { gas: estimate });

      Example.autoGas = true;
    });

    // Constructor in this test consumes ~6437823 (susybraid) vs blockLimit of 6721975.
    it("should not multiply past the blockLimit", async function() {
      this.timeout(50000);
      let iterations = 1000; // # of times to set a uint in a loop, consuming gas.

      const estimate = await Example.new.estimateGas(iterations);
      const block = await susyweb.sof.getBlock("latest");
      const multiplier = Example.gasMultiplier;

      assert(multiplier === 1.25, "Multiplier should be initialized to 1.25");
      assert(
        multiplier * estimate > block.gasLimit,
        "Multiplied estimate should be too high"
      );
      assert(estimate < block.gasLimit, "Estimate on it's own should be ok");

      await Example.new(iterations);
    });
  });

  describe("susyweb timeout overrides", function() {
    it("should override 50 blocks err / return a usable instance", async function() {
      this.timeout(50000);

      // Mock susyweb non-response, fire error @ block 50, resolve receipt @ block 52.
      const tempSendTransaction = Example.susyweb.sof.sendTransaction;
      const tempGetTransactionReceipt = Example.susyweb.sof.getTransactionReceipt;

      Example.susyweb.sof.sendTransaction = util.fakeSendTransaction;
      Example.susyweb.sof.getTransactionReceipt = util.fakeNoReceipt;
      Example.timeoutBlocks = 52;

      const example = await Example.new(1).on(
        "transactionHash",
        async function() {
          for (var i = 1; i < 50; i++) {
            await util.svm_mine();
          }
          await util.fakeReject();
          await util.svm_mine();
          await util.svm_mine();
          Example.susyweb.sof.getTransactionReceipt = util.fakeGotReceipt;
          await util.svm_mine();
        }
      );

      // Restore susyweb
      Example.susyweb.sof.sendTransaction = tempSendTransaction;
      Example.susyweb.sof.getTransactionReceipt = tempGetTransactionReceipt;

      await example.setValue(77);
      const newValue = await example.value();
      assert.equal(
        newValue,
        77,
        "Should have returned a usable contract instance"
      );
    });
  });
});
