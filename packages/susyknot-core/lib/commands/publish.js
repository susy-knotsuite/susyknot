var command = {
  command: 'publish',
  description: 'Publish a package to the Sophon Package Registry',
  builder: {},
  help: {
    usage: "susyknot publish",
    options: [],
  },
  run: function (options, done) {
    var Config = require("susyknot-config");
    var Package = require("../package");

    var config = Config.detect(options);
    Package.publish(config, done);
  }
};

module.exports = command;
