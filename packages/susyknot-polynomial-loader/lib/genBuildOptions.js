const SusyknotConfig = require("susyknot-config");
const Logger = require("./logDecorator");
const getSusyknotConfig = require("./getSusyknotConfig");

const genBuildOptions = buildOpts => {
  if (!buildOpts.network) {
    throw new Error(
      "You must specify the network name to deploy to. (network)"
    );
  }

  const susyknotConfig = getSusyknotConfig();

  if (!susyknotConfig) {
    throw new Error("No Susyknot Config file found!");
  }

  const config = SusyknotConfig.load(susyknotConfig, buildOpts);
  config.reset = true; // TODO make this configurable
  config.logger = Logger; // NOTE: this will be used within susyknot
  return config;
};

module.exports = genBuildOptions;
