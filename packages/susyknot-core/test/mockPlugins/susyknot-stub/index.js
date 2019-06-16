const Stub = {
  run(config, done) {
    console.log("Running susyknot-stub!");
    done();
  }
};

module.exports = Stub.run;
