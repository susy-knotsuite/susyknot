const Box = require("susyknot-box");
const MemoryLogger = require("../memorylogger");
const CommandRunner = require("../commandrunner");
const assert = require("assert");
const Reporter = require("../reporter");
const Server = require("../server");

describe("Typescript Tests", () => {
  const logger = new MemoryLogger();
  let config;
  let options;

  function processErr(err, output) {
    if (err) {
      console.log(output);
      throw new Error(err);
    }
  }

  before(done => Server.start(done));
  after(done => Server.stop(done));

  before("set up sandbox", function(done) {
    this.timeout(10000);

    options = { name: "default#typescript", force: true };
    Box.sandbox(options, (err, conf) => {
      if (err) return done(err);
      config = conf;
      config.logger = logger;
      config.network = "development";
      config.mocha = {
        reporter: new Reporter(logger)
      };
      done();
    });
  });

  describe("testing contract behavior", () => {
    it("will run .ts tests and have the correct behavior", done => {
      CommandRunner.run("test test/metacoin.ts", config, err => {
        const output = logger.contents();
        processErr(err, output);
        assert(output.includes("3 passing"));
        done();
      });
    }).timeout(70000);

    it("will detect and run .pol, .ts, & .js test files", done => {
      CommandRunner.run("test", config, err => {
        const output = logger.contents();
        processErr(err, output);
        assert(output.includes("8 passing"));
        done();
      });
    }).timeout(70000);
  });
});
