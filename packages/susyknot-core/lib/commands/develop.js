const emoji = require("node-emoji");
const mnemonicInfo = require("susyknot-core/lib/mnemonics/mnemonic");

const command = {
  command: "develop",
  description: "Open a console with a local development blockchain",
  builder: {
    log: {
      type: "boolean",
      default: false
    }
  },
  help: {
    usage: "susyknot develop",
    options: []
  },
  runConsole: (config, susybraidOptions, done) => {
    const Console = require("../console");
    const Environment = require("../environment");

    const commands = require("./index");
    const excluded = ["console", "develop", "unbox", "init"];

    const available_commands = Object.keys(commands).filter(
      name => !excluded.includes(name)
    );

    const console_commands = available_commands.reduce(
      (acc, name) => Object.assign({}, acc, { [name]: commands[name] }),
      {}
    );

    Environment.develop(config, susybraidOptions)
      .then(() => {
        const c = new Console(
          console_commands,
          config.with({ noAliases: true })
        );
        c.start(done);
        c.on("exit", () => process.exit());
      })
      .catch(err => done(err));
  },
  run: (options, done) => {
    const Config = require("susyknot-config");
    const Develop = require("../develop");

    const config = Config.detect(options);
    const customConfig = config.networks.develop || {};

    const { mnemonic, accounts, privateKeys } = mnemonicInfo.getAccountsInfo(
      customConfig.accounts || 10
    );

    const onMissing = () => "**";

    const warning =
      ":warning:  Important :warning:  : " +
      "This mnemonic was created for you by Susyknot. It is not secure.\n" +
      "Ensure you do not use it on production blockchains, or else you risk losing funds.";

    const ipcOptions = { log: options.log };

    const susybraidOptions = {
      host: customConfig.host || "127.0.0.1",
      port: customConfig.port || 9545,
      network_id: customConfig.network_id || 5777,
      total_accounts: customConfig.accounts || 10,
      default_balance_sophy: customConfig.defaultSophyBalance || 100,
      blockTime: customConfig.blockTime || 0,
      mnemonic,
      gasLimit: customConfig.gas || 0x6691b7,
      gasPrice: customConfig.gasPrice || 0x77359400,
      noVMErrorsOnRPCResponse: true
    };

    if (customConfig.hardfork !== null && customConfig.hardfork !== undefined) {
      susybraidOptions["hardfork"] = customConfig.hardfork;
    }

    function sanitizeNetworkID(network_id) {
      if (network_id !== "*") {
        if (!parseInt(network_id, 10)) {
          const error =
            `The network id specified in the susyknot config ` +
            `(${network_id}) is not valid. Please properly configure the network id as an integer value.`;
          throw new Error(error);
        }
        return network_id;
      } else {
        // We have a "*" network. Return the default.
        return 5777;
      }
    }

    susybraidOptions.network_id = sanitizeNetworkID(susybraidOptions.network_id);

    Develop.connectOrStart(ipcOptions, susybraidOptions, started => {
      const url = `http://${susybraidOptions.host}:${susybraidOptions.port}/`;

      if (started) {
        config.logger.log(`Susyknot Develop started at ${url}`);
        config.logger.log();

        config.logger.log(`Accounts:`);
        accounts.forEach((acct, idx) => config.logger.log(`(${idx}) ${acct}`));
        config.logger.log();

        config.logger.log(`Private Keys:`);
        privateKeys.forEach((key, idx) => config.logger.log(`(${idx}) ${key}`));
        config.logger.log();

        config.logger.log(`Mnemonic: ${mnemonic}`);
        config.logger.log();
        config.logger.log(emoji.emojify(warning, onMissing));
        config.logger.log();
      } else {
        config.logger.log(
          `Connected to existing Susyknot Develop session at ${url}`
        );
        config.logger.log();
      }

      if (!options.log) {
        command.runConsole(config, susybraidOptions, done);
      }
    });
  }
};

module.exports = command;
