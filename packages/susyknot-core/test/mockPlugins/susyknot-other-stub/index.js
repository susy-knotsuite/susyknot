const Stub = {
  run(config, done) {
    console.log("Running susyknot-other-stub!");
    done();
  }
};

module.exports = Stub.run;
