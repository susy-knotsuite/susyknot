<img src="https://susyknotframework.com/img/susyknot-logo-dark.svg" width="200">

[![npm](https://img.shields.io/npm/v/susyknot.svg)](https://www.npmjs.com/package/susyknot)
[![npm](https://img.shields.io/npm/dm/susyknot.svg)](https://www.npmjs.com/package/susyknot)
[![Join the chat at https://gitter.im/consensys/susyknot](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/consensys/susyknot?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/susy-knotsuite/susyknot.svg?branch=next)](https://travis-ci.org/susy-knotsuite/susyknot)
[![Coverage Status](https://coveralls.io/repos/github/susy-knotsuite/susyknot/badge.svg?branch=next)](https://coveralls.io/github/susy-knotsuite/susyknot?branch=next)

-----------------------


Susyknot is a development environment, testing framework and asset pipeline for Sophon, aiming to make life as an Sophon developer easier. With Susyknot, you get:

* Built-in smart contract compilation, linking, deployment and binary management.
* Automated contract testing with Mocha and Chai.
* Configurable build pipeline with support for custom build processes.
* Scriptable deployment & migrations framework.
* Network management for deploying to many public & private networks.
* Interactive console for direct contract communication.
* Instant rebuilding of assets during development.
* External script runner that executes scripts within a Susyknot environment.

| ℹ️ **Contributors**: Please see the [Development](#development) section of this README. |
| --- |

### Install

```
$ npm install -g susyknot
```

### Quick Usage

For a default set of contracts and tests, run the following within an empty project directory:

```
$ susyknot init
```

From there, you can run `susyknot compile`, `susyknot migrate` and `susyknot test` to compile your contracts, deploy those contracts to the network, and run their associated unit tests.

Susyknot comes bundled with a local development blockchain server that launches automatically when you invoke the commands  above. If you'd like to [configure a more advanced development environment](https://susyknotframework.com/docs/advanced/configuration) we recommend you install the blockchain server separately by running `npm install -g susybraid-cli` at the command line.

+  [susybraid-cli](https://github.com/susy-knotsuite/susybraid-cli): a command-line version of Susyknot's blockchain server.
+  [susybraid](https://susyknotframework.com/susybraid/): A GUI for the server that displays your transaction history and chain state.


### Documentation

Please see the [Official Susyknot Documentation](https://susyknotframework.com/docs/) for guides, tips, and examples.

### Development

We welcome pull requests. To get started, just fork this repo, clone it locally, and run:

```shell
# Install
npm install -g lerna@3.4.3
npm install -g yarn
yarn bootstrap

# Test
yarn test

# Adding dependencies to a package
cd packages/<susyknot-package>
yarn add <npm-package> [--dev] # Use yarn
```

If you'd like to update a dependency to the same version across all packages, you might find [this utility](https://www.npmjs.com/package/lerna-update-wizard) helpful.

*Notes on project branches:*
+    `master`: Stable, released version (v5)
+    `beta`: Released beta version
+    `develop`: Work targeting stable release (v5)
+    `next`: Upcoming feature development and most new work

Please make pull requests against `next` for any substantial changes. Small changes and bugfixes can be considered for `develop`.

There is a bit more information in the [CONTRIBUTING.md](./CONTRIBUTING.md) file.

### License

MIT
