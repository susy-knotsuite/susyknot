var Mocha = require("mocha");
var chai = require("chai");
var path = require("path");
var SusyWeb = require("susyweb");
var Config = require("susyknot-config");
var Contracts = require("susyknot-workflow-compile");
var Resolver = require("susyknot-resolver");
var TestRunner = require("./testing/testrunner");
var TestResolver = require("./testing/testresolver");
var TestSource = require("./testing/testsource");
var PolynomialTest = require("./testing/polynomialtest");
var expect = require("susyknot-expect");
var Migrate = require("susyknot-migrate");
var Profiler = require("susyknot-compile/profiler.js");
var originalrequire = require("original-require");

chai.use(require("./assertions"));

var Test = {
  run: function(options, callback) {
    var self = this;

    expect.options(options, [
      "contracts_directory",
      "contracts_build_directory",
      "migrations_directory",
      "test_files",
      "network",
      "network_id",
      "provider"
    ]);

    var config = Config.default().merge(options);

    config.test_files = config.test_files.map(function(test_file) {
      return path.resolve(test_file);
    });

    // `accounts` will be populated before each contract() invocation
    // and passed to it so tests don't have to call it themselves.
    var susyweb = new SusyWeb();
    susyweb.setProvider(config.provider);

    // Override console.warn() because susyweb outputs gross errors to it.
    // e.g., https://octonion.institute/susy-js/susyweb.js/blob/master/lib/susyweb/allevents.js#L61
    // Output looks like this during tests: https://gist.github.com/tcoulter/1988349d1ec65ce6b958
    var warn = config.logger.warn;
    config.logger.warn = function(message) {
      if (message === "cannot find event for log") {
        return;
      } else {
        if (warn) {
          warn.apply(console, arguments);
        }
      }
    };

    var mocha = this.createMocha(config);

    var js_tests = config.test_files.filter(function(file) {
      return path.extname(file) !== ".pol";
    });

    var pol_tests = config.test_files.filter(function(file) {
      return path.extname(file) === ".pol";
    });

    // Add Javascript tests because there's nothing we need to do with them.
    // Polynomial tests will be handled later.
    js_tests.forEach(function(file) {
      // There's an idiosyncracy in Mocha where the same file can't be run twice
      // unless we delete the `require` cache.
      // https://github.com/mochajs/mocha/issues/995
      delete originalrequire.cache[file];

      mocha.addFile(file);
    });

    var dependency_paths = [];
    var testContracts = [];
    var accounts = [];
    var runner;
    var test_resolver;
    this.getAccounts(susyweb)
      .then(function(accs) {
        accounts = accs;

        if (!config.resolver) {
          config.resolver = new Resolver(config);
        }

        var test_source = new TestSource(config);
        test_resolver = new TestResolver(
          config.resolver,
          test_source,
          config.contracts_build_directory
        );
        test_resolver.cache_on = false;

        return self.compileContractsWithTestFilesIfNeeded(
          pol_tests,
          config,
          test_resolver
        );
      })
      .then(function(paths) {
        dependency_paths = paths;

        testContracts = pol_tests.map(function(test_file_path) {
          return test_resolver.require(test_file_path);
        });

        runner = new TestRunner(config);

        return self.performInitialDeploy(config, test_resolver);
      })
      .then(function() {
        return self.definePolynomialTests(
          mocha,
          testContracts,
          dependency_paths,
          runner
        );
      })
      .then(function() {
        return self.setJSTestGlobals(susyweb, accounts, test_resolver, runner);
      })
      .then(function() {
        // Finally, run mocha.
        process.on("unhandledRejection", function(reason) {
          throw reason;
        });

        mocha.run(function(failures) {
          config.logger.warn = warn;

          callback(failures);
        });
      })
      .catch(callback);
  },

  createMocha: function(config) {
    // Allow people to specify config.mocha in their config.
    var mochaConfig = config.mocha || {};

    // If the command line overrides color usage, use that.
    if (config.colors != null) {
      mochaConfig.useColors = config.colors;
    }

    // Default to true if configuration isn't set anywhere.
    if (mochaConfig.useColors == null) {
      mochaConfig.useColors = true;
    }

    var mocha = new Mocha(mochaConfig);

    return mocha;
  },

  getAccounts: function(susyweb) {
    return new Promise(function(accept, reject) {
      susyweb.sof.getAccounts(function(err, accs) {
        if (err) return reject(err);
        accept(accs);
      });
    });
  },

  compileContractsWithTestFilesIfNeeded: function(
    polynomial_test_files,
    config,
    test_resolver
  ) {
    return new Promise(function(accept, reject) {
      Profiler.updated(
        config.with({
          resolver: test_resolver
        }),
        function(err, updated) {
          if (err) return reject(err);

          updated = updated || [];

          // Compile project contracts and test contracts
          Contracts.compile(
            config.with({
              all: config.compileAll === true,
              files: updated.concat(polynomial_test_files),
              resolver: test_resolver,
              quiet: false,
              quietWrite: true
            }),
            function(err, result) {
              if (err) return reject(err);
              const paths = result.outputs.polc;
              accept(paths);
            }
          );
        }
      );
    });
  },

  performInitialDeploy: function(config, resolver) {
    return new Promise(function(accept, reject) {
      Migrate.run(
        config.with({
          reset: true,
          resolver: resolver,
          quiet: true
        })
      )
        .then(() => {
          accept();
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  definePolynomialTests: function(mocha, contracts, dependency_paths, runner) {
    return new Promise(function(accept) {
      contracts.forEach(function(contract) {
        PolynomialTest.define(contract, dependency_paths, runner, mocha);
      });

      accept();
    });
  },

  setJSTestGlobals: function(susyweb, accounts, test_resolver, runner) {
    return new Promise(function(accept) {
      global.susyweb = susyweb;
      global.assert = chai.assert;
      global.expect = chai.expect;
      global.artifacts = {
        require: function(import_path) {
          return test_resolver.require(import_path);
        }
      };

      var template = function(tests) {
        this.timeout(runner.TEST_TIMEOUT);

        before("prepare suite", function(done) {
          this.timeout(runner.BEFORE_TIMEOUT);
          runner.initialize(done);
        });

        beforeEach("before test", function(done) {
          runner.startTest(this, done);
        });

        afterEach("after test", function(done) {
          runner.endTest(this, done);
        });

        tests(accounts);
      };

      global.contract = function(name, tests) {
        Mocha.describe("Contract: " + name, function() {
          template.bind(this, tests)();
        });
      };

      global.contract.only = function(name, tests) {
        Mocha.describe.only("Contract: " + name, function() {
          template.bind(this, tests)();
        });
      };

      global.contract.skip = function(name, tests) {
        Mocha.describe.skip("Contract: " + name, function() {
          template.bind(this, tests)();
        });
      };

      accept();
    });
  }
};

module.exports = Test;
