const util = require("util");

const Stub = {
  run: util.promisify(function() {
    console.log("Running susyknot-promise-stub!");
  })
};

module.exports = Stub.run;
