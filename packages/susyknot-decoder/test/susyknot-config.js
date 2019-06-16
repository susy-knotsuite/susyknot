/**
 * Use this file to configure your susyknot project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * susyknotframework.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like susyknot-hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura API
 * keys are available for free at: infura.io/register
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

// const HDWallet = require('susyknot-hdwallet-provider');
// const infuraKey = "fj4jll3k.....";
//
// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  /**
   * Networks define how you connect to your sophon client and let you set the
   * defaults susyweb uses to send transactions. If you don't specify one susyknot
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a susyknot command to use a specific
   * network from the command line, e.g
   *
   * $ susyknot test --network <network-name>
   */

  networks: {
    // Useful for testing. The `development` name is special - susyknot uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like susybraid-cli, graviton or susy) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    //
    // development: {
    //   host: "127.0.0.1", // Localhost (default: none)
    //   port: 7545, // Standard Sophon port (default: none)
    //   network_id: "*" // Any network (default: none)
    // }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    polc: {
      version: "0.4.23" // Fetch exact version from polc-bin (default: susyknot's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the polynomial docs for advice about optimization and svmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  svmVersion: "constantinople"
      // }
    }
  }
};
