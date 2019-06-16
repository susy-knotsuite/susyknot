const assert = require("assert");
const fs = require("fs");
const SusyknotConfig = require("../");

describe("SusyknotConfig.detect", () => {
  it("throws if a susyknot config isn't detected", () => {
    assert.throws(() => {
      SusyknotConfig.detect();
    }, "should have thrown!");
  });
});

before(() => {
  fs.closeSync(fs.openSync(`./test/susyknot-config.js`, "w"));
  fs.closeSync(fs.openSync(`./test/susyknot.js`, "w"));
});
after(() => {
  fs.unlinkSync(`./test/susyknot-config.js`);
  fs.unlinkSync(`./test/susyknot.js`);
});

describe("SusyknotConfig.search", () => {
  const options = {
    workingDirectory: `${process.cwd()}/test`
  };
  let loggedStuff = "";
  console.warn = stringToLog => {
    loggedStuff = loggedStuff + stringToLog;
  };
  it("returns null if passed a file that doesn't exist", () => {
    const nonExistentConfig = SusyknotConfig.search(options, "badConfig.js");
    assert.strictEqual(nonExistentConfig, null);
  });

  it("outputs warning and returns susyknot-config.js path if both susyknot.js and susyknot-config.js are found", () => {
    susyknotConfigPath = SusyknotConfig.search(options);
    assert.strictEqual(
      susyknotConfigPath,
      `${process.cwd()}/test/susyknot-config.js`
    );
    assert(
      loggedStuff.includes(
        "Warning: Both susyknot-config.js and susyknot.js were found."
      )
    );
  });

  it("outputs warning and returns susyknot.js path if only susyknot.js detected on windows ", () => {
    fs.unlinkSync(`./test/susyknot-config.js`);
    Object.defineProperty(process, "platform", {
      value: "windows"
    });

    susyknotConfigPath = SusyknotConfig.search(options);

    assert.strictEqual(susyknotConfigPath, `${process.cwd()}/test/susyknot.js`);
    assert(loggedStuff.includes("Warning: Please rename susyknot.js"));

    fs.closeSync(fs.openSync(`./test/susyknot-config.js`, "w"));
  });
});
