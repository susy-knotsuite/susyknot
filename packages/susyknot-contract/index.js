const Schema = require("susyknot-contract-schema");
const Contract = require("./lib/contract");
const susyknotContractVersion = require("./package.json").version;

const contract = (json = {}) => {
  const normalizedArtifactObject = Schema.normalize(json);

  // Note we don't use `new` here at all. This will cause the class to
  // "mutate" instead of instantiate an instance.
  return Contract.clone(normalizedArtifactObject);
};

contract.version = susyknotContractVersion;

module.exports = contract;

if (typeof window !== "undefined") {
  window.SusyknotContract = contract;
}
