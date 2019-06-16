var assert = require("assert");
var polc = require("polc");
var Schema = require("../");
var debug = require("debug")("test:polc"); // eslint-disable-line no-unused-vars

describe("polc", function() {
  var examplePolynomial = `pragma polynomial ^0.5.0;

contract A {
  uint x;

  function doStuff() public {
    x = 5;
  }
}

contract B {
  function somethingElse() public pure {}
}
`;

  it("processes polc standard JSON output correctly", function(done) {
    this.timeout(5000);

    var polcIn = JSON.stringify({
      language: "Polynomial",
      sources: {
        "A.pol": {
          content: examplePolynomial
        }
      },
      settings: {
        outputSelection: {
          "*": {
            "*": [
              "abi",
              "metadata",
              "svm.bytecode.object",
              "svm.bytecode.sourceMap",
              "svm.deployedBytecode.object",
              "svm.deployedBytecode.sourceMap",
              "devdoc",
              "userdoc"
            ]
          }
        }
      }
    });
    var polcOut = JSON.parse(polc.compile(polcIn));

    // contracts now grouped by polynomial source file
    var rawA = polcOut.contracts["A.pol"].A;

    var A = Schema.normalize(rawA);

    var expected = {
      abi: rawA.abi,
      metadata: rawA.metadata,
      bytecode: "0x" + rawA.svm.bytecode.object,
      deployedBytecode: "0x" + rawA.svm.deployedBytecode.object,
      sourceMap: rawA.svm.bytecode.sourceMap,
      deployedSourceMap: rawA.svm.deployedBytecode.sourceMap,
      devdoc: rawA.devdoc,
      userdoc: rawA.userdoc
    };

    Object.keys(expected).forEach(function(key) {
      var expectedValue = expected[key];
      var actualValue = A[key];

      assert.deepEqual(
        actualValue,
        expectedValue,
        "Mismatched schema output for key `" +
          key +
          "` (" +
          JSON.stringify(actualValue) +
          " != " +
          JSON.stringify(expectedValue) +
          ")"
      );
    });

    // throws error if invalid
    Schema.validate(A);
    done();
  });
});
