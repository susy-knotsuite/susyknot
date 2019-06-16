const command = {
  command: "run",
  description: "Run a third-party command",
  builder: {},
  help: {
    usage: "susyknot run [<command>]",
    options: [
      {
        option: "<command>",
        description: "Name of the third-party command to run."
      }
    ]
  },
  run(options, done) {
    const Config = require("susyknot-config");
    const Plugin = require("../plugin");
    const Run = require("../run");
    const config = Config.detect(options);

    if (options._.length === 0) {
      const help = require("./help");
      help.displayCommandHelp("run");
      return done();
    }

    const customCommand = options._[0];

    if (config.plugins) {
      let pluginConfigs = Plugin.load(config);
      Run.run(pluginConfigs, customCommand, config, done);
    } else {
      console.error(
        "\nError: No plugins detected in the configuration file.\n"
      );
      done();
    }
  }
};

module.exports = command;