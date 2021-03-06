const colors = require("colors");
const commandExistsSync = require("command-exists").sync;

const command = {
  command: "watch",
  description:
    "Watch filesystem for changes and rebuild the project automatically",
  builder: {},
  help: {
    usage: "susyknot watch",
    options: []
  },
  run: function(options) {
    const Config = require("susyknot-config");
    const sane = require("sane");
    const path = require("path");

    const config = Config.detect(options);

    const watchOptions = {
      ignored: [
        "build/**/**",
        /[\/\\]\./ // Ignore files prefixed with .
      ]
    };
    // Certain large codebases have trouble with the watch command.
    // Installing watchman resolves some of these issues.
    if (commandExistsSync("watchman")) {
      watchOptions.watchman = true;
    } else {
      config.logger.log(
        "If you have trouble using watch, try installing watchman."
      );
    }

    const watchCallback = filePath => {
      const displayPath = path.join(
        "./",
        filePath.replace(config.working_directory, "")
      );
      config.logger.log(colors.cyan(">> File " + displayPath + " changed."));

      build(config);
    };

    const watcher = sane(config.working_directory, watchOptions);
    watcher.on("change", watchCallback);
    watcher.on("add", watchCallback);
    watcher.on("delete", watchCallback);

    config.logger.log(
      colors.green("Watching for a change in project files...")
    );
  }
};

const build = config => {
  const Build = require("../build");

  config.logger.log("Rebuilding...");

  Build.build(config, function(error) {
    printSummary(config, error);
  });
};

const printSummary = (config, error) => {
  if (error) {
    const SusyknotError = require("susyknot-error");
    if (error instanceof SusyknotError) {
      console.log(error.message);
    } else {
      // Bubble up all other unexpected errors.
      console.log(error.stack || error.toString());
    }
  } else {
    config.logger.log(
      colors.green("Completed without errors on " + new Date().toString())
    );
  }
};

module.exports = command;
