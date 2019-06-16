const MemoryLogger = require("../memorylogger");
const CommandRunner = require("../commandrunner");
const path = require("path");
const assert = require("assert");
const Server = require("../server");
const Reporter = require("../reporter");
const sandbox = require("../sandbox");
const SusyWeb = require("susyweb");

const log = console.log;

function processErr(err, output) {
  if (err) {
    log(output);
    throw new Error(err);
  }
}

describe("migrate with quroum interface", function() {
  let config;
  let susyweb;
  let networkId;
  const project = path.join(__dirname, "../../sources/migrations/quorum");
  const logger = new MemoryLogger();

  before(done => Server.start(done));
  after(done => Server.stop(done));

  before(async function() {
    this.timeout(10000);
    config = await sandbox.create(project);
    config.network = "development";
    config.logger = logger;
    config.mocha = {
      reporter: new Reporter(logger)
    };

    const provider = new SusyWeb.providers.HttpProvider("http://localhost:8545", {
      keepAlive: false
    });
    susyweb = new SusyWeb(provider);
    networkId = await susyweb.sof.net.getId();
  });

  it("runs migrations (sync & async/await)", function(done) {
    this.timeout(70000);

    CommandRunner.run("migrate", config, err => {
      const output = logger.contents();
      processErr(err, output);

      assert(output.includes("Saving successful migration to network"));
      assert(!output.includes("Error encountered, bailing"));
      assert(!output.includes("invalid or does not take any parameters"));

      const location = path.join(
        config.contracts_build_directory,
        "UsesExample.json"
      );
      const artifact = require(location);
      const network = artifact.networks[networkId];

      assert(output.includes(network.address));

      console.log(output);
      done();
    });
  });
});
