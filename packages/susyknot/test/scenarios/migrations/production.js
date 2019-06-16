const MemoryLogger = require("../memorylogger");
const CommandRunner = require("../commandrunner");
const path = require("path");
const assert = require("assert");
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

describe("production", function() {
  describe("{production: true, confirmations: 2 } [ @graviton ]", function() {
    if (!process.env.GRAVITON) return;

    let config;
    let susyweb;
    let networkId;
    const project = path.join(__dirname, "../../sources/migrations/production");
    const logger = new MemoryLogger();

    before(async function() {
      this.timeout(10000);
      config = await sandbox.create(project);
      config.network = "ropsten";
      config.logger = logger;
      config.mocha = {
        reporter: new Reporter(logger)
      };

      const provider = new SusyWeb.providers.HttpProvider(
        "http://localhost:8545",
        { keepAlive: false }
      );
      susyweb = new SusyWeb(provider);
      networkId = await susyweb.sof.net.getId();
    });

    it("auto dry-runs and honors confirmations option", function(done) {
      this.timeout(70000);

      CommandRunner.run("migrate --network ropsten", config, err => {
        const output = logger.contents();
        processErr(err, output);

        assert(output.includes("dry-run"));

        assert(output.includes("2_migrations_conf.js"));
        assert(output.includes("Deploying 'Example'"));

        const location = path.join(
          config.contracts_build_directory,
          "Example.json"
        );
        const artifact = require(location);
        const network = artifact.networks[networkId];

        assert(output.includes(network.transactionHash));
        assert(output.includes(network.address));

        // Graviton automines too quickly for the 4 sec resolution we set
        // to trigger the output.
        if (!process.env.GRAVITON) {
          assert(output.includes("2 confirmations"));
          assert(output.includes("confirmation number: 1"));
          assert(output.includes("confirmation number: 2"));
        }

        console.log(output);
        done();
      });
    });
  });

  describe("{production: true, skipDryRun: true } [ @graviton ]", function() {
    if (!process.env.GRAVITON) return;

    let config;
    let susyweb;
    let networkId;
    const project = path.join(__dirname, "../../sources/migrations/production");
    const logger = new MemoryLogger();

    before(async function() {
      this.timeout(10000);
      config = await sandbox.create(project);
      config.network = "fakeRopsten";
      config.logger = logger;
      config.mocha = {
        reporter: new Reporter(logger)
      };

      const provider = new SusyWeb.providers.HttpProvider(
        "http://localhost:8545",
        { keepAlive: false }
      );
      susyweb = new SusyWeb(provider);
      networkId = await susyweb.sof.net.getId();
    });

    it("migrates without dry-run", function(done) {
      this.timeout(70000);

      CommandRunner.run("migrate --network fakeRopsten", config, err => {
        const output = logger.contents();
        processErr(err, output);

        assert(!output.includes("dry-run"));

        assert(output.includes("2_migrations_conf.js"));
        assert(output.includes("Deploying 'Example'"));

        const location = path.join(
          config.contracts_build_directory,
          "Example.json"
        );
        const artifact = require(location);
        const network = artifact.networks[networkId];

        assert(output.includes(network.transactionHash));
        assert(output.includes(network.address));

        console.log(output);
        done();
      });
    });
  });
});
