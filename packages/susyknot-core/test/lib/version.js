const version = require("../../lib/version");
const assert = require("assert");
const { core, polc } = version.info();
const susyknotVersion = require("../../package.json").version;
let logger, config, nodeVersion;

describe("susyknot-core/lib/version", () => {
  beforeEach(() => {
    logger = {
      log: function(stringToLog) {
        this.loggedStuff = this.loggedStuff + stringToLog;
      },
      loggedStuff: ""
    };
    config = {
      compilers: {
        polc: {
          version: "0.5.0"
        }
      }
    };
  });

  describe("logAll()", () => {
    it("logs some version information", () => {
      version.logAll(logger, config);
      assert(logger.loggedStuff.includes(core));
      assert(logger.loggedStuff.includes(polc));
    });
  });

  describe("logSusyknotAndNode()", () => {
    it("logs susyknot and node versions", () => {
      version.logSusyknotAndNode(logger, config);
      nodeVersion = process.version;
      assert(logger.loggedStuff.includes(nodeVersion));
      assert(logger.loggedStuff.includes(susyknotVersion));
    });
  });
});
