// Override artifactor
var assert = require("chai").assert;
var temp = require("temp").track();
var contract = require("../");
var SusyWeb = require("susyweb");
var debug = require("debug")("susybraid-core");
var Susybraid = require("susybraid-core");
var path = require("path");
var fs = require("fs");
var Compile = require("susyknot-compile");
const { promisify } = require("util");

// Clean up after polynomial. Only remove polynomial's listener,
// which happens to be the first.
process.removeListener(
  "uncaughtException",
  process.listeners("uncaughtException")[0] || function() {}
);

var log = {
  log: debug
};

describe("Library linking", function() {
  var LibraryExample;
  var provider = Susybraid.provider({ logger: log });
  var network_id;
  var susyweb = new SusyWeb();
  susyweb.setProvider(provider);

  before(function() {
    return susyweb.sof.net.getId().then(function(id) {
      network_id = id;
    });
  });

  before(function() {
    LibraryExample = contract({
      contractName: "LibraryExample",
      abi: [],
      binary:
        "606060405260ea8060106000396000f3606060405260e060020a600035046335b09a6e8114601a575b005b601860e160020a631ad84d3702606090815273__A_____________________________________906335b09a6e906064906020906004818660325a03f415600257506040805160e160020a631ad84d37028152905173__B_____________________________________9350600482810192602092919082900301818660325a03f415600257506040805160e160020a631ad84d37028152905173821735ac2129bdfb20b560de2718783caf61ad1c9350600482810192602092919082900301818660325a03f41560025750505056"
    });

    LibraryExample.setNetwork(network_id);
  });

  after(function(done) {
    temp.cleanupSync();
    done();
  });

  it("leaves binary unlinked initially", function() {
    assert(
      LibraryExample.binary.indexOf(
        "__A_____________________________________"
      ) >= 0
    );
  });

  it("links first library properly", function() {
    LibraryExample.link("A", "0x1234567890123456789012345678901234567890");

    assert(
      LibraryExample.binary.indexOf("__A_____________________________________"),
      -1
    );
    assert(
      LibraryExample.binary ===
        "0x606060405260ea8060106000396000f3606060405260e060020a600035046335b09a6e8114601a575b005b601860e160020a631ad84d37026060908152731234567890123456789012345678901234567890906335b09a6e906064906020906004818660325a03f415600257506040805160e160020a631ad84d37028152905173__B_____________________________________9350600482810192602092919082900301818660325a03f415600257506040805160e160020a631ad84d37028152905173821735ac2129bdfb20b560de2718783caf61ad1c9350600482810192602092919082900301818660325a03f41560025750505056"
    );
  });

  it("links second library properly", function() {
    LibraryExample.link("B", "0x1111111111111111111111111111111111111111");

    assert(
      LibraryExample.binary.indexOf("__B_____________________________________"),
      -1
    );
    assert(
      LibraryExample.binary ===
        "0x606060405260ea8060106000396000f3606060405260e060020a600035046335b09a6e8114601a575b005b601860e160020a631ad84d37026060908152731234567890123456789012345678901234567890906335b09a6e906064906020906004818660325a03f415600257506040805160e160020a631ad84d3702815290517311111111111111111111111111111111111111119350600482810192602092919082900301818660325a03f415600257506040805160e160020a631ad84d37028152905173821735ac2129bdfb20b560de2718783caf61ad1c9350600482810192602092919082900301818660325a03f41560025750505056"
    );
  });

  it("allows for selective relinking", function() {
    assert(
      LibraryExample.binary.indexOf("__A_____________________________________"),
      -1
    );
    assert(
      LibraryExample.binary.indexOf("__B_____________________________________"),
      -1
    );

    LibraryExample.link("A", "0x2222222222222222222222222222222222222222");

    assert(
      LibraryExample.binary ===
        "0x606060405260ea8060106000396000f3606060405260e060020a600035046335b09a6e8114601a575b005b601860e160020a631ad84d37026060908152732222222222222222222222222222222222222222906335b09a6e906064906020906004818660325a03f415600257506040805160e160020a631ad84d3702815290517311111111111111111111111111111111111111119350600482810192602092919082900301818660325a03f415600257506040805160e160020a631ad84d37028152905173821735ac2129bdfb20b560de2718783caf61ad1c9350600482810192602092919082900301818660325a03f41560025750505056"
    );
  });
});

describe("Library linking with contract objects", function() {
  var ExampleLibrary;
  var ExampleLibraryConsumer;
  var accounts;
  var susyweb;
  var network_id;
  var provider = Susybraid.provider({ logger: log });
  susyweb = new SusyWeb();
  susyweb.setProvider(provider);

  before(function() {
    return susyweb.sof.net.getId().then(function(id) {
      network_id = id;
    });
  });

  before(async function() {
    this.timeout(10000);

    const exampleLibraryPath = path.join(
      __dirname,
      "sources",
      "ExampleLibrary.pol"
    );
    const exampleLibraryConsumerPath = path.join(
      __dirname,
      "sources",
      "ExampleLibraryConsumer.pol"
    );
    var sources = {
      "ExampleLibrary.pol": fs.readFileSync(exampleLibraryPath, {
        encoding: "utf8"
      }),
      "ExampleLibraryConsumer.pol": fs.readFileSync(
        exampleLibraryConsumerPath,
        { encoding: "utf8" }
      )
    };

    const options = {
      contracts_directory: path.join(__dirname, "sources"),
      quiet: true,
      compilers: {
        polc: {
          version: "0.5.0",
          settings: {
            optimizer: {
              enabled: false,
              runs: 200
            }
          }
        }
      }
    };

    // Compile first
    var result = await promisify(Compile)(sources, options);

    var library, libraryContractName;
    if (result["ExampleLibrary"]) {
      libraryContractName = "ExampleLibrary";
    } else {
      libraryContractName = "ExampleLibrary.pol:ExampleLibrary";
    }
    library = result[libraryContractName];
    library.contractName = libraryContractName;
    ExampleLibrary = contract(library);
    ExampleLibrary.setProvider(provider);

    var consumer, consumerContractName;
    if (result["ExampleLibraryConsumer"]) {
      consumerContractName = "ExampleLibraryConsumer";
    } else {
      consumerContractName =
        "ExampleLibraryConsumer.pol:ExampleLibraryConsumer";
    }
    consumer = result[consumerContractName];
    consumer.contractName = consumerContractName;
    ExampleLibraryConsumer = contract(consumer);
    ExampleLibraryConsumer.setProvider(provider);
  });

  before(function(done) {
    susyweb.sof.getAccounts(function(err, accs) {
      accounts = accs;

      ExampleLibrary.defaults({
        from: accounts[0]
      });

      ExampleLibraryConsumer.defaults({
        from: accounts[0]
      });

      ExampleLibrary.setNetwork(network_id);
      ExampleLibraryConsumer.setNetwork(network_id);

      done(err);
    });
  });

  before("deploy library", function(done) {
    ExampleLibrary.new({ gas: 3141592 })
      .then(function(instance) {
        ExampleLibrary.address = instance.address;
      })
      .then(done)
      .catch(done);
  });

  after(function(done) {
    temp.cleanupSync();
    done();
  });

  it("should consume library's events when linked", function(done) {
    ExampleLibraryConsumer.link(ExampleLibrary);

    assert.equal(Object.keys(ExampleLibraryConsumer.events || {}).length, 1);

    ExampleLibraryConsumer.new({ gas: 3141592 })
      .then(function(consumer) {
        return consumer.triggerLibraryEvent();
      })
      .then(function(result) {
        assert.equal(result.logs.length, 1);
        var log = result.logs[0];
        assert.equal(log.event, "LibraryEvent");
        assert.equal(accounts[0], log.args._from);
        assert.equal(8, log.args.num); // 8 is a magic number inside ExampleLibrary.pol
      })
      .then(done)
      .catch(done);
  });
});
