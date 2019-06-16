var debug = require("debug")("provider"); // eslint-disable-line no-unused-vars
var SusyWeb = require("susyweb");
var SusyWebShim = require("susyknot-interface-adapter").SusyWebShim;

var wrapper = require("./wrapper");

module.exports = {
  wrap: function(provider, options) {
    return wrapper.wrap(provider, options);
  },

  create: function(options) {
    var provider;

    if (options.provider && typeof options.provider === "function") {
      provider = options.provider();
    } else if (options.provider) {
      provider = options.provider;
    } else if (options.websockets) {
      provider = new SusyWeb.providers.WebsocketProvider(
        "ws://" + options.host + ":" + options.port
      );
    } else {
      provider = new SusyWeb.providers.HttpProvider(
        `http://${options.host}:${options.port}`,
        { keepAlive: false }
      );
    }

    return this.wrap(provider, options);
  },

  test_connection: function(provider, callback) {
    var susyweb = new SusyWebShim({ provider });
    var fail = new Error(
      "Could not connect to your RPC client. Please check your RPC configuration."
    );

    susyweb.sof
      .getCoinbase()
      .then(coinbase => callback(null, coinbase))
      .catch(() => callback(fail, null));
  }
};
