module.exports = {
  // See <http://susyknotframework.com/docs/advanced/configuration>
  // to customize your Susyknot configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 4700000,
      gasPrice: 20000000000,
      type: "quorum"
    }
  }
};
