<img src="https://susyknotframework.com/img/susyknot-logo-dark.svg" width="200">

[![npm](https://img.shields.io/npm/v/susyknot.svg)]()
[![npm](https://img.shields.io/npm/dm/susyknot.svg)]()
[![Join the chat at https://gitter.im/consensys/susyknot](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/consensys/susyknot?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

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

Susyknot comes bundled with a local development blockchain server that launches automatically when you invoke the commands  above. If you'd like to [configure a more advanced development environment](http://susyknotframework.com/docs/advanced/configuration) we recommend you install the blockchain server separately by running `npm install -g susybraid-cli` at the command line.

+  [susybraid-cli](https://github.com/susy-knotsuite/susybraid-cli): a command-line version of Susyknot's blockchain server.
+  [susybraid](http://susyknotframework.com/susybraid/): A GUI for the server that displays your transaction history and chain state.


### Documentation

Please see the [Official Susyknot Documentation](http://susyknotframework.com/docs/) for guides, tips, and examples.

### Contributing

This package is a distribution package of the Susyknot command line tool. Please see [susyknot-core](https://github.com/susy-knotsuite/susyknot-core) to contribute to the main core code.

### License

MIT
