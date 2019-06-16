In cases where you need a bit more customization, you can now add an `external` property to the config.  You would use this in cases where you have a command that generates artifacts, a command that generates custom artifacts from Susyknot artifacts, or where you want to customize the artifacts that Susyknot generates.

If you were to have a script named `myScript.sh` which outputs artifacts to `./myBuildFolder`, you would configure the susyknot config file as follows:
```javascript
module.exports = {
  compilers: {
    external: {
      command: "myScript.sh",
      targets: [{
        path: "./myBuildFolder/*.json"
      }]
    }
  }
}
```
This would run your compilation script, locate all the json files in `myBuildFolder`, and then copy them into your Susyknot project's build folder with the rest of your compiled contracts as part of the compilation process.

