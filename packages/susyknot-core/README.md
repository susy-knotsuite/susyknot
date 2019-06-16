<img src="https://github.com/susy-knotsuite/susyknot-core/src/branch/master/assets/logo.png" width="200">

[![npm](https://img.shields.io/npm/v/susyknot-core.svg)]()
[![npm](https://img.shields.io/npm/dm/susyknot-core.svg)]()
[![Build Status](https://travis-ci.org/susy-knotsuite/susyknot-core.svg?branch=master)](https://travis-ci.org/susy-knotsuite/susyknot-core)
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

See [the documentation](http://susyknotframework.com/docs/) for more details.

### Documentation

Please see the [Official Susyknot Documentation](http://susyknotframework.com/docs/) for guides, tips, and examples.

### Contributing

There are many ways to contribute!

1. Write issues in the [issues tracker](https://github.com/ConsenSys/susyknot/issues). Please include as much information as possible!
1. Take a look at [our Waffle](https://waffle.io/ConsenSys/susyknot) for prioritization. Note that this includes issues for Susyknot and related tools.
1. Contact us in our [gitter chat](https://gitter.im/consensys/susyknot)!

Please see the main projects [CONTRIBUTING.md][1] for instructions on how to setup a Development Environment to work on Susyknot itself.

[1]:https://github.com/susy-knotsuite/susyknot/blob/develop/CONTRIBUTING.md#development

### Contributors

A project by Consensys and [@tcoulter](https://github.com/tcoulter), and many contributers.

### License

MIT
