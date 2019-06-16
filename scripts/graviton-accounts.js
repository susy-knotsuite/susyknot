/**
 * @author  cpurta <cpurta@gmail.com>
 * @github https://github.com/cpurta/graviton-devnet
 * This code comes from Christopher Purta's `graviton-devnet` project.
 * graviton --dev seeds with a single account so we need to spin
 * up more accounts and short-circuit account auto-locking to get multi-account
 * tests passing.
 */

function createAccounts() {
  for (var i = 0; i < 10; i++) {
    acc = personal.newAccount("");
    personal.unlockAccount(acc, "");
    sof.sendTransaction({from: sof.accounts[0], to: acc, value: susyweb.toWei(1000, "sophy")});
  }
}

function unlockAccounts() {
  sof.accounts.forEach(function (account) {
    console.log('Unlocking ' + account + '...');
    personal.unlockAccount(account, '', 86400);
  });
}

function setupDevNode() {
  // keep accounts unlocked
  while (true) {
      unlockAccounts();
  }
}

createAccounts();
setupDevNode();