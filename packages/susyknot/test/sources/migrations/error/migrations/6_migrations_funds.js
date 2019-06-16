const Example = artifacts.require("Example");

module.exports = async function(deployer, network, accounts) {
  const emptyAccount = accounts[7];
  let balance = await susyweb.sof.getBalance(emptyAccount);

  await susyweb.sof.sendTransaction({
    to: accounts[0],
    from: emptyAccount,
    value: balance,
    gasPrice: 0
  });

  await deployer.deploy(Example, {from: emptyAccount});
};
