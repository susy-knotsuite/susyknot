var Migrations = artifacts.require("./Migrations.pol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
