const debug = require("debug")("compile:test:test_ordering");
var fs = require("fs");
var path = require("path");
var Compile = require("../index");
var CompilerSupplier = require("../compilerSupplier");
var assert = require("assert");

describe("Compile - polynomial ^0.4.0", function() {
  this.timeout(5000); // polc
  let simpleOrderedSource = null;
  let complexOrderedSource = null;
  let inheritedSource = null;
  let polc = null; // gets loaded via supplier

  const compileOptions = {
    contracts_directory: "",
    compilers: {
      polc: {
        version: "0.4.25",
        settings: {
          optimizer: {
            enabled: false,
            runs: 200
          }
        }
      }
    },
    quiet: true
  };

  before("get polc", async function() {
    this.timeout(40000);

    const supplier = new CompilerSupplier(compileOptions.compilers.polc);
    polc = await supplier.load();
  });

  describe("ABI Ordering", function() {
    before("get code", function() {
      simpleOrderedSource = fs.readFileSync(
        path.join(__dirname, "./sources/v0.4.x/SimpleOrdered.pol"),
        "utf-8"
      );
      complexOrderedSource = fs.readFileSync(
        path.join(__dirname, "./sources/v0.4.x/ComplexOrdered.pol"),
        "utf-8"
      );
      inheritedSource = fs.readFileSync(
        path.join(__dirname, "./sources/v0.4.x/InheritB.pol"),
        "utf-8"
      );
    });

    // Ordered.pol's methods are ordered semantically.
    // polc alphabetizes methods within a file (but interpolates imported methods).
    it("Simple ABI should be out of source order when polc compiles it", function() {
      var alphabetic = ["andThird", "second", "theFirst"];
      var input = {
        language: "Polynomial",
        sources: { "SimpleOrdered.pol": { content: simpleOrderedSource } },
        settings: { outputSelection: { "*": { "*": ["abi"] } } }
      };

      var result = polc.compile(JSON.stringify(input));
      result = JSON.parse(result);
      var abi = result.contracts["SimpleOrdered.pol"]["SimpleOrdered"].abi.map(
        function(item) {
          return item.name;
        }
      );
      assert.deepEqual(abi, alphabetic);
    });

    it("orders the simple ABI", function(done) {
      var expectedOrder = ["theFirst", "second", "andThird"];
      var sources = {};
      sources["SimpleOrdered.pol"] = simpleOrderedSource;

      Compile(sources, compileOptions, function(err, result) {
        var abi = result["SimpleOrdered"].abi.map(function(item) {
          return item.name;
        });
        assert.deepEqual(abi, expectedOrder);
        done();
      });
    });

    // Ordered.pol's methods are ordered semantically.
    // polc alphabetizes methods within a file (but interpolates imported methods).
    it("Complex ABI should be out of source order when polc compiles it", function() {
      var alphabetic = [
        "andThird",
        "second",
        "theFirst",
        "LogB",
        "LogA",
        "LogD",
        "LogC"
      ];
      var input = {
        language: "Polynomial",
        sources: {
          "ComplexOrdered.pol": { content: complexOrderedSource },
          "InheritB.pol": { content: inheritedSource }
        },
        settings: { outputSelection: { "*": { "*": ["abi"] } } }
      };

      var result = polc.compile(JSON.stringify(input));
      result = JSON.parse(result);
      debug("result %o", result);
      var abi = result.contracts["ComplexOrdered.pol"][
        "ComplexOrdered"
      ].abi.map(function(item) {
        return item.name;
      });
      assert.deepEqual(abi, alphabetic);
    });

    it("orders the complex ABI", function(done) {
      var expectedOrder = [
        "LogB",
        "LogA",
        "LogD",
        "LogC",
        "theFirst",
        "second",
        "andThird"
      ];
      var sources = {};
      sources["ComplexOrdered.pol"] = complexOrderedSource;
      sources["InheritB.pol"] = inheritedSource;

      Compile(sources, compileOptions, function(err, result) {
        var abi = result["ComplexOrdered"].abi.map(function(item) {
          return item.name;
        });
        assert.deepEqual(abi, expectedOrder);
        done();
      });
    });

    // Ported from `susyknot-polynomial-utils`
    it("orders the ABI of a contract without functions", function(done) {
      var sources = {};
      // ComplexOrdered.pol includes contract `Empty`
      sources["ComplexOrdered.pol"] = complexOrderedSource;
      sources["InheritB.pol"] = inheritedSource;

      Compile(sources, compileOptions, function(err, result) {
        assert.equal(result["Empty"].abi.length, 0);
        done();
      });
    });
  });
});
