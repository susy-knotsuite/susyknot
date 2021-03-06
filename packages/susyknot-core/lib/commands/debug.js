const command = {
  command: "debug",
  description:
    "Interactively debug any transaction on the blockchain (experimental)",
  builder: {
    _: {
      type: "string"
    }
  },
  help: {
    usage: "susyknot debug [<transaction_hash>]",
    options: [
      {
        option: "<transaction_hash>",
        description: "Transaction ID to use for debugging."
      }
    ]
  },
  run: function(options, done) {
    const debugModule = require("debug");
    const debug = debugModule("lib:commands:debug");

    const Config = require("susyknot-config");
    const Environment = require("../environment");

    const { CLIDebugger } = require("../debug");

    Promise.resolve()
      .then(async () => {
        const config = Config.detect(options);
        await Environment.detect(config);

        const txHash = config._[0]; //may be undefined
        return await new CLIDebugger(config).run(txHash);
      })
      .then(interpreter => interpreter.start(done))
      .catch(done);
  }
};

module.exports = command;
