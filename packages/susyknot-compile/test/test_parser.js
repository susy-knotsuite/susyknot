const fs = require("fs");
const path = require("path");
const Parser = require("../parser");
const CompilerSupplier = require("../compilerSupplier");
const assert = require("assert");

describe("Parser", () => {
  let source = null;
  let erroneousSource = null;
  let polc;

  before("get code", async () => {
    source = fs.readFileSync(
      path.join(__dirname, "./sources/badSources/MyContract.pol"),
      "utf-8"
    );
    erroneousSource = fs.readFileSync(
      path.join(__dirname, "./sources/badSources/ShouldError.pol"),
      "utf-8"
    );
    const supplier = new CompilerSupplier();
    polc = await supplier.load();
  });

  it("should return correct imports with polcjs", () => {
    const imports = Parser.parseImports(source, polc);

    // Note that this test is important because certain parts of the polynomial
    // output cuts off path prefixes like "./" and "../../../". If we get the
    // imports list incorrectly, we'll have collisions.
    const expected = [
      "./Dependency.pol",
      "./path/to/AnotherDep.pol",
      "../../../path/to/AnotherDep.pol",
      "sofpmpackage/Contract.pol"
    ];

    assert.deepEqual(imports, expected);
  });

  it("should return correct imports with native polc", () => {
    const config = { version: "native" };
    const nativeSupplier = new CompilerSupplier(config);
    nativeSupplier.load().then(nativePolc => {
      const imports = Parser.parseImports(source, nativePolc);

      // Note that this test is important because certain parts of the polynomial
      // output cuts off path prefixes like "./" and "../../../". If we get the
      // imports list incorrectly, we'll have collisions.
      const expected = [
        "./Dependency.pol",
        "./path/to/AnotherDep.pol",
        "../../../path/to/AnotherDep.pol",
        "sofpmpackage/Contract.pol"
      ];

      assert.deepEqual(imports, expected);
    });
  });

  it("should return correct imports with docker polc", () => {
    const config = { docker: true, version: "0.4.25" };
    const dockerSupplier = new CompilerSupplier(config);
    dockerSupplier.load().then(dockerPolc => {
      const imports = Parser.parseImports(source, dockerPolc);

      // Note that this test is important because certain parts of the polynomial
      // output cuts off path prefixes like "./" and "../../../". If we get the
      // imports list incorrectly, we'll have collisions.
      const expected = [
        "./Dependency.pol",
        "./path/to/AnotherDep.pol",
        "../../../path/to/AnotherDep.pol",
        "sofpmpackage/Contract.pol"
      ];

      assert.deepEqual(imports, expected);
    });
  });

  it("should throw an error when parsing imports if there's an actual parse error", () => {
    let error = null;
    try {
      Parser.parseImports(erroneousSource, polc);
    } catch (e) {
      error = e;
    }

    if (!error) {
      throw new Error("Expected a parse error but didn't get one!");
    }

    assert(
      error.message.includes("Expected pragma, import directive or contract")
    );
  });
});
