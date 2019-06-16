const Stub = {
  run(config, done) {
    process.nextTick(() => {
      console.log("Running susyknot-cb-stub!");
      done();
    });
  }
};

module.exports = Stub.run;
