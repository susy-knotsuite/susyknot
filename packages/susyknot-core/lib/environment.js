const SusyWeb = require("susyweb");
const SusyWebShim = require("susyknot-interface-adapter").SusyWebShim;
const SusyknotError = require("susyknot-error");
const expect = require("susyknot-expect");
const Resolver = require("susyknot-resolver");
const Artifactor = require("susyknot-artifactor");
const Susybraid = require("susybraid-core");

const Environment = {
  // It's important config is a Config object and not a vanilla object
  detect: async function(config) {
    expect.options(config, ["networks"]);

    helpers.setUpConfig(config);
    helpers.validateNetworkConfig(config);

    const susyweb = new SusyWebShim({
      provider: config.provider,
      networkType: config.networks[config.network].type
    });

    await helpers.detectAndSetNetworkId(config, susyweb);
    await helpers.setFromOnConfig(config, susyweb);
  },

  // Ensure you call Environment.detect() first.
  fork: async function(config) {
    expect.options(config, ["from", "provider", "networks", "network"]);

    const susyweb = new SusyWebShim({
      provider: config.provider,
      networkType: config.networks[config.network].type
    });

    const accounts = await susyweb.sof.getAccounts();
    const block = await susyweb.sof.getBlock("latest");

    const upstreamNetwork = config.network;
    const upstreamConfig = config.networks[upstreamNetwork];
    const forkedNetwork = config.network + "-fork";

    config.networks[forkedNetwork] = {
      network_id: config.network_id,
      provider: Susybraid.provider({
        fork: config.provider,
        unlocked_accounts: accounts,
        gasLimit: block.gasLimit
      }),
      from: config.from,
      gas: upstreamConfig.gas,
      gasPrice: upstreamConfig.gasPrice
    };
    config.network = forkedNetwork;
  },

  develop: async (config, susybraidOptions) => {
    expect.options(config, ["networks"]);

    const network = config.network || "develop";
    const url = `http://${susybraidOptions.host}:${susybraidOptions.port}/`;

    config.networks[network] = {
      network_id: susybraidOptions.network_id,
      provider: function() {
        return new SusyWeb.providers.HttpProvider(url, { keepAlive: false });
      }
    };

    config.network = network;

    return await Environment.detect(config);
  }
};

const helpers = {
  setFromOnConfig: async (config, susyweb) => {
    if (config.from) return;

    const accounts = await susyweb.sof.getAccounts();
    config.networks[config.network].from = accounts[0];
  },

  detectAndSetNetworkId: async (config, susyweb) => {
    const configNetworkId = config.networks[config.network].network_id;
    const providerNetworkId = await susyweb.sof.net.getId();
    if (configNetworkId !== "*") {
      // Ensure the network id matches the one in the config for safety
      if (providerNetworkId.toString() !== configNetworkId.toString()) {
        const error =
          `The network id specified in the susyknot config ` +
          `(${configNetworkId}) does not match the one returned by the network ` +
          `(${providerNetworkId}).  Ensure that both the network and the ` +
          `provider are properly configured.`;
        throw new Error(error);
      }
    } else {
      // We have a "*" network. Get the current network and replace it with the real one.
      // TODO: Should we replace this with the blockchain uri?
      config.networks[config.network].network_id = providerNetworkId;
    }
  },

  validateNetworkConfig: config => {
    const networkConfig = config.networks[config.network];

    if (!networkConfig) {
      throw new SusyknotError(
        `Unknown network "${config.network}` +
          `". See your Susyknot configuration file for available networks.`
      );
    }

    const configNetworkId = config.networks[config.network].network_id;

    if (configNetworkId == null) {
      throw new Error(
        `You must specify a network_id in your '` +
          `${config.network}' configuration in order to use this network.`
      );
    }
  },

  setUpConfig: config => {
    if (!config.resolver) {
      config.resolver = new Resolver(config);
    }

    if (!config.artifactor) {
      config.artifactor = new Artifactor(config.contracts_build_directory);
    }

    if (!config.network) {
      if (config.networks["development"]) {
        config.network = "development";
      } else {
        config.network = "susybraid";
        config.networks[config.network] = {
          host: "127.0.0.1",
          port: 7545,
          network_id: 5777
        };
      }
    }
  }
};

module.exports = Environment;
