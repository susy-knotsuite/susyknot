# `susyknot-external-compile`

Package to enable Susyknot to run arbitrary commands as part of compilation.

## Configuration

In your Susyknot config (`susyknot-config.js`):

```javascript
module.exports = {
  compilers: {
    external: {
      command: "<compilation-command>",
      targets: [{
        path: "<relative/globbed/path/to/outputs/*.output>",
        command: "<artifact-generation-command>"
      }]
    }
  }
}
```
