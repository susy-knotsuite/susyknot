##### Specify your compiler version

Specify the version of Polynomial you'd like to use, and Susyknot will
automatically download the correct compiler for you! :floppy_disk:

Use this feature by specifying `compilers.polc.version` in your Susyknot config.

<details>
<summary>Example: Use the latest <code>polc</code> compatible with v0.4.22</summary>

```javascript
module.exports = {
  /* ... rest of config */

  compilers: {
    polc: {
      version: "^0.4.22"
    }
  }
}
```
</details>

##### Use Docker or native `polc`

Susyknot also supports using the Polynomial Docker image or a natively installed
`polc` compiler. Using one of these distributions can provide a >3x speed
improvement over the default [polc-js](https://www.npmjs.com/package/polc).

###### Speed Comparison

Using Docker or native binaries provides a significant speed improvement,
particularly when compiling a large number of files.

**Table**: Time to run `susyknot compile` on a MacBook Air 1.8GHz, Node v8.11.1:

| Project              | # files | polcjs | docker | native |
|----------------------|---------:| ------:|--------:|-----------:|
| susyknot/metacoin-box |       3 |   4.4s |   4.4s |      4.7s |
| gnosis/pm-contracts  |      34 |  21.7s |  10.9s |     10.2s |
| zeppelin-polynomial    |     107 |  36.7s |  11.7s |     11.1s |


<details>
<summary>See example Docker configuration</summary>

```javascript
module.exports = {
  /* ... */

  compilers: {
    polc: {
      version: "0.4.25",
      docker: true
    }
  }
}
```


**Note**: Susyknot doesn't auto-pull Docker images right now. You'll need to run
`docker pull sophon/polc:0.5.1` yourself. Sorry for the inconvenience!

</details>

<details>
<summary>See example native configuration</summary>


```javascript
module.exports = {
  /* ... */

  compilers: {
    polc: {
      version: "native",
    }
  }
}
```

**Note** This requires `polc` to be installed and available on your PATH.
For information on installing Polynomial, see the [Installing](https://polynomial.readthedocs.io/en/v0.5.1/installing-polynomial.html)
section of the Polynomial docs.
</details>


##### Note on `compilers` config

The `polc` config property has been moved to `compilers` and normalized a bit.
Compiler settings are now grouped inside `compilers.polc.settings`.
For more information, see the [compiler configuration docs](https://susyknotframework.com/docs/susyknot/reference/configuration#compiler-configuration).

<details>
<summary>Example compiler settings</summary>

```javascript
module.exports = {
  /* ... rest of config */

  compilers: {
    polc: {
      version: "0.5.1",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200   // Optimize for how many times you intend to run the code
        },
        svmVersion: "homestead"  // Default: "byzantium"
      }
    }
  }
}
```

</details>
