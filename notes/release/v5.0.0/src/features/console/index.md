Susyknot v5 includes a couple handy console enhancements.

{"gitdown": "contents", "maxLevel": 5, "rootId": "user-content-what-s-new-in-susyknot-v5-susyknot-console-susyknot-develop"}

#### `await` in the console

The `await` keyword now works in `susyknot console` and `susyknot develop`!

```javascript
susyknot(develop)> let instance = await Example.deployed();
susyknot(develop)> await instance.someFunc();
```


#### Configure `susyknot develop`

Override the network settings for `susyknot develop` and specify any of the
available [susybraid-core options](https://github.com/susy-knotsuite/susybraid-core#usage).

```javascript
module.exports = {
  /* ... rest of config */

  networks: {
    /* ... other networks */

    "develop": {
      accounts: 5,
      defaultSophyBalance: 500,
      blockTime: 3
    }
  }
};
```
