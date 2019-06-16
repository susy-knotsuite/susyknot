# ALPHA - UNPUBLISHED - EXPERIMENTAL USE ONLY

This module is an early work in progress. For the moment it is totally unsupported and should only be used in an experimental context.

# susyknot-sawtooth-ssof-provider

A susyweb provider which makes it possible to connect Susyknot with Sawtooth Ssof blockchains.

## Supported operations

We intend to add support for all operations listed below, but items with a ❌ are yet to be completed.

 - `susyknot migrate` ✔️
 - Use with `susyknot-contract` in browser ✔️
 - `susyknot test` ✔️ (if running against ssof build which includes hyperledger/sawtooth-ssof#77)
 - `susyknot debug` ❌

## Important differences between Sawtooth Ssof and Core Sophon

It's important to know that Ssof doesn't behave exactly like core Sophon. An incomplete list of these differences is below.

- No `status` flags on transaction receipt.
- Transaction receipts contain the transaction's return data.
- No support for the `REVERT` opcode.
- Gas price is always `0`.
- Much larger block and transaction hashes.
- Sawtooth's underlying data structure is a [Radix Merkle Tree](https://sawtooth.hyperledger.org/docs/core/releases/1.0/architecture/global_state.html#radix-merkle-tree-overview) instead of a Merkle Patricia Tree.
- Blocks aren't mined in Sawtooth, they're validated by a central [validator network](https://sawtooth.hyperledger.org/docs/core/releases/1.0/architecture/validator_network.html).
- You must enable the [BlockInfo Transaction Family](https://sawtooth.hyperledger.org/docs/core/releases/1.0/transaction_family_specifications/blockinfo_transaction_family.html) if your contracts reqire the ability to read blockchain metadata (e.g. the previous block's hash).

For a more comprehensive understanding of Sawtooth's architecture, please see the [Architecture Description](https://sawtooth.hyperledger.org/docs/core/releases/1.0/architecture.html) section of [Sawtooth's documentation site](https://sawtooth.hyperledger.org/docs/core/releases/1.0/).


## Library usage

### Installation

`npm install --save-dev susyknot-sawtooth-ssof-provider`

### Susyknot configuration

Example `susyknot-config.js`:

```javascript
const SsofProvider = require('susyknot-sawtooth-ssof-provider');

module.exports = {
  networks: {
    ssof: {
      provider: new SsofProvider('http://127.0.0.1:3030'),
      network_id: "*" // Match any network id
    }
  }
};
```

### Usage in the browser with Webpack

Webpack is highly recommended for frontend usage. This README won't cover how to set up webpack for your project, as each project is different. However, when packing `susyknot-sawtoot-ssof-provider` you may see an error about an inability to resolve the `fs` module. The fs module isn't required for frontend use, so you can safely work around this error message by adding the following to your webpack configuration:

```javascript
node: {
   fs: "empty"
}
```

### Troubleshooting

#### Printing RPC requests and responses
This module makes use of the `debug` module to print RPC requests and responses. The debug module key for this module is `SsofProvider`.

To enable RPC request/response output on the command line, ensure your `DEBUG` environment variable contains `SsofProvider:RPC`.

To enable RPC request/response output in the browser, open your debugging console and run `localStorage.debug = 'SsofProvider:RPC'` and refresh the page.

For more on how to use the `debug` module, see the [Usage section in the debug module's README](https://github.com/visionmedia/debug/src/branch/master/README.md#usage).
