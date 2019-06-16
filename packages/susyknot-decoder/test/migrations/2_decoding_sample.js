const DecodingSample = artifacts.require("./DecodingSample.pol");

module.exports = function(deployer) {
  deployer.deploy(DecodingSample);
};
