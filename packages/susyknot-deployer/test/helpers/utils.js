const SusyknotContract = require('susyknot-contract');
const workflow = require('susyknot-workflow-compile');
const path = require('path');
const fs = require('fs-extra');

const utils = {

  miningId: null,

  // Constants
  zeroAddress: '0x0000000000000000000000000000000000000000',

  // Paths
  buildDir: path.join(__dirname, '../build'),
  sourcesDir: path.join(__dirname, '../sources'),

  compile: async function(){
     const config = {
      contracts_build_directory: utils.buildDir,
      contracts_directory: utils.sourcesDir
    };

    return new Promise((accept, reject) => {
      workflow.compile(config, err => err ? reject(err) : accept());
    });
  },

  svm_mine: function(susyweb){
    return new Promise(function(accept, reject){
      susyweb.currentProvider.send({
        jsonrpc: "2.0",
        method: "svm_mine",
        id: new Date().getTime()
      }, function(err, result){
          (err) ? reject(err) : accept(result);
      });
    });
  },

  startAutoMine: function(susyweb, interval){
    utils.miningId = setInterval(async() => {
      await utils.svm_mine(susyweb);
    }, interval);
  },

  stopAutoMine: () => clearInterval(utils.miningId),

  waitMS: async (ms) => new Promise(resolve => setTimeout(() => resolve(), ms)),

  cleanUp: () => fs.removeSync(utils.buildDir),

  getContract: function(name, provider, networkId, account){
    const json = require(`../build/${name}`);
    const contract = SusyknotContract(json);
    contract.setProvider(provider);
    contract.setNetwork(networkId);
    contract.defaults({ from: account });
    return contract;
  },
};

module.exports = utils;
