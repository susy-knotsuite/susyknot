module.exports = {
  command: "obtain",
  description: "Fetch and cache a specified compiler",
  help: {
    usage: "susyknot obtain <--<compiler_name> <version>>",
    options: [
      {
        option: "<--<compiler_name> <version>>",
        description:
          `Download and cache a version of the specified compiler.\n` +
          `                    compiler_name must be one of the following: ` +
          `'polc'.(required)`
      }
    ]
  },
  run: function(options, done) {
    const CompilerSupplier = require("susyknot-compile").CompilerSupplier;
    const supplier = new CompilerSupplier();
    const SUPPORTED_COMPILERS = ["--polc"];

    if (options.polc) {
      return this.downloadAndCachePolc({ options, supplier })
        .then(done)
        .catch(done);
    }

    const message =
      `You have specified a compiler that is unsupported by ` +
      `Susyknot.\nYou must specify one of the following ` +
      `compilers as well as a version as arguments: ` +
      `${SUPPORTED_COMPILERS.join(", ")}\nSee 'susyknot help ` +
      `obtain' for more information and usage.`;
    return done(new Error(message));
  },
  downloadAndCachePolc: async ({ options, supplier }) => {
    const logger = options.logger || console;
    const version = options.polc;
    const polc = await supplier.downloadAndCachePolc(version);
    return logger.log(
      `    > successfully downloaded and cached ${polc.version()}`
    );
  }
};
