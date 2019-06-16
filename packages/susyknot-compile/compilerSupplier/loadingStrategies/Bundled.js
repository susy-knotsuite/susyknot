const LoadingStrategy = require("./LoadingStrategy");

class Bundled extends LoadingStrategy {
  load() {
    return this.getBundledPolc();
  }

  getBundledPolc() {
    this.removeListener();
    return require("polc");
  }
}

module.exports = Bundled;
