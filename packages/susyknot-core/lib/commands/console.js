var command = {
  command: "console",
  description:
    "Run a console with contract abstractions and commands available",
  builder: {},
  help: {
    usage: "susyknot console [--network <name>] [--verbose-rpc]",
    options: [
      {
        option: "--network <name>",
        description:
          "Specify the network to use. Network name must exist in the configuration."
      },
      {
        option: "--verbose-rpc",
        description:
          "Log communication between Susyknot and the Sophon client."
      }
    ]
  },
  run: function(options, done) {
    var Config = require("susyknot-config");
    var Console = require("../console");
    var Environment = require("../environment");

    var config = Config.detect(options);

    // This require a smell?
    var commands = require("./index");
    var excluded = ["console", "init", "watch", "develop"];

    var available_commands = Object.keys(commands).filter(function(name) {
      return excluded.indexOf(name) === -1;
    });

    var console_commands = {};
    available_commands.forEach(function(name) {
      console_commands[name] = commands[name];
    });

    Environment.detect(config)
      .then(() => {
        const c = new Console(
          console_commands,
          config.with({ noAliases: true })
        );
        c.start(done);
      })
      .catch(error => {
        done(error);
      });
  }
};

module.exports = command;
