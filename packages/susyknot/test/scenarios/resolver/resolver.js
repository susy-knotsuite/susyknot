var MemoryLogger = require("../memorylogger");
var CommandRunner = require("../commandrunner");
var path = require("path");
var assert = require("assert");
var Server = require("../server");
var Reporter = require("../reporter");
var sandbox = require("../sandbox");
var log = console.log;

describe("Polynomial Imports [ @standalone ]", function() {
  var config;
  var project = path.join(__dirname, "../../sources/monorepo");
  var logger = new MemoryLogger();

  before(done => Server.start(done));
  after(done => Server.stop(done));

  /**
   * Directory Structure
   * -------------------
   *
   * + node_modules/
   * |-- nodepkg/
   * |   |-- ImportOfImport.pol # Local import for NodeImport.pol
   * |   |-- NodeImport.pol
   * |
   * + installed_contracts/
   * |-- sofpmpkg/
   * |   |-- SofPMImport.pol
   * |
   * + susyknotproject/
   * |-- contracts/
   * |   |-- Importer.pol # This imports everthing
   * |-- node_modules/
   * |   |-- nodepkg/
   * |      |-- LocalNodeImport.pol
   * |-- susyknot-config.js
   * |
   * + errorproject/
   * |-- contracts/
   * |   |-- Importer.pol # Imports a non-existent file
   * |
   */

  describe("success", function() {
    before(function() {
      this.timeout(10000);
      return sandbox.create(project, "susyknotproject").then(conf => {
        config = conf;
        config.network = "development";
        config.logger = logger;
        config.mocha = {
          reporter: new Reporter(logger)
        };
      });
    });

    it("resolves polynomial imports located outside the working directory", function(done) {
      this.timeout(30000);

      CommandRunner.run("compile", config, function(err) {
        const output = logger.contents();
        if (err) {
          log(output);
          return done(err);
        }

        assert(output.includes("./contracts/Importer.pol"));
        assert(output.includes("sofpmpkg/SofPMImport.pol"));
        assert(output.includes("nodepkg/ImportOfImport.pol"));
        assert(output.includes("nodepkg/LocalNodeImport.pol"));
        assert(output.includes("nodepkg/NodeImport.pol"));

        done();
      });
    });
  });

  describe("failure", function() {
    before(function() {
      this.timeout(10000);
      return sandbox.create(project, "errorproject").then(conf => {
        config = conf;
        config.network = "development";
        config.logger = logger;
        config.mocha = {
          reporter: new Reporter(logger)
        };
      });
    });

    it("fails gracefully if an import is not found", function(done) {
      this.timeout(30000);

      CommandRunner.run("compile", config, function(err) {
        const output = logger.contents();
        assert(err);
        assert(output.includes("Error"));
        assert(output.includes("Could not find nodepkg/DoesNotExist.pol"));
        assert(output.includes("Importer.pol"));
        done();
      });
    });
  });
});
