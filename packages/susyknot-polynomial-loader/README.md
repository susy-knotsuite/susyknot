## susyknot-polynomial-loader

A Webpack loader that allows importing a polynomial contract directly. Importing returns a susyknot artifact json object. This allows smart contract development with Hot Reloading support and enables migrations to automatically re-run on change. When running a production build, contracts will be bundled into main bundle for easy deployment.

## Example

```javascript
const SusyWeb = require("susyweb"); // currently compatible up to susyweb@1.0.0-beta.37
const provider = new SusyWeb.providers.HttpProvider("http://localhost:8545");
const contract = require("susyknot-contract");

import myContractArtifact from '../contracts/MyContract.pol';
const MyContract = contract(myContractArtifact);

MyContract.setProvider(provider);
```

You can see this plugin in operation in the [Susyknot+Webpack Demo App](https://github.com/ConsenSys/susyknot-webpack-demo). The demo is for Susyknot 4.0 & Webpack 4.

This package will re-run migration scripts whenever polynomial files are modified. If you have multiple polynomial files, the entire project will be redeployed.

## Installation

`$ npm install --save-dev susyknot-polynomial-loader`

Add the appropriate config to your `loaders` section of your Webpack 4 config:

```javascript
{
  test: /\.pol/,
  use: [
    {
      loader: 'json-loader'
    },
    {
      loader: 'susyknot-polynomial-loader',
      options: {
        network: 'susybraid',
      }
    }
  ]
}
```

Webpack applies loaders [right to left](https://webpack.js.org/api/loaders/#pitching-loader), therefore the output of `susyknot-polynomial-loader` goes into `json-loader`.


### `susyknot-config.js` integration

The loader will auto detect a `susyknot-config.js` (or `susyknot.js`) config file in your project and use that for configuration.

### Loader options

  - `migrations_directory`: The path susyknot migration scripts
  - `network`: A network name to use
  - `contracts_build_directory`: path to directory of susyknot JSON artifacts

```javascript
{
  test: /\.pol/,
  use: [
    {
      loader: 'json-loader'
    },
    {
      loader: 'susyknot-polynomial-loader',
      options: {
        network: 'susybraid',
        migrations_directory: path.resolve(__dirname, './migrations'),
        contracts_build_directory: path.resolve(__dirname, './build/contracts')
      }
    }
  ]
}
```


## Contributing

- Open an issue to report bugs or provide feedback.
- Submit PRs.
- Respect the project coding style: StandardJS.

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## License
MIT
