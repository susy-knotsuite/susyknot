# Introduction and prerequisites

Susyknot uses lerna to manage multi-package repositories. Each Susyknot module is defined in its own npm package in the `packages/` directory.

The entry point of these modules is `susyknot-core`. This is where the command line parser is setup.

Install lerna:

```shell
$ npm install -g lerna
$ npm install -g yarn
```

# The command flow

The heart of Susyknot lies in the `susyknot-core` package. Whenever a command is run, `susyknot-core/cli.js` gets run with everything following `susyknot` (on the command line) being passed in as arguments. In other words, if you run `susyknot migrate --network myNetwork`, then `susyknot-core/cli.js` gets run with "migrate" and "--network myNetwork" as arguments.

Throughout the course of running `susyknot-core/cli.js`, Susyknot parses out what commands and options the user has provided, instantiates an instance of the `Command` class, and calls the `run` method on that instance. The `run` method is the interface that `cli.js` uses for ALL commands. You can find all of the specific command files (one file for each command) at `susyknot-core/lib/commands`. From the run method of each command you should be able to trace the command lifecycle to libraries and modules in `susyknot-core` as well as other packages in the monorepo.

# Add a new command in susyknot

### Create a new lerna package

```shell
$ lerna create susyknot-mycmd
```

### Add the package to `susyknot-core`

```shell
$ lerna add susyknot-mycmd --scope=susyknot-core
```

### Create a new command in `susyknot-core`

Create a new file in `packages/susyknot-core/lib/commands/`, let's call it `mycmd.js`.

```shell
$ cat << EOF > susyknot-core/lib/commands/mycmd.js
const command = {
  command: "mycmd",
  description: "Run mycmd",
  builder: {},
  help: {
    usage: "susyknot mycmd",
    options: []
  },
  run: function(options, done) {
    const mycmd = require("susyknot-mycmd");
    // TODO: write the run command here, something like:
    // mycmd(options, done)
  }
};

module.exports = command;
EOF
```

### Link it from the commands/index.js file

```diff
--- packages/susyknot-core/lib/commands/index.js
+++ packages/susyknot-core/lib/commands/index.js
@@ -1,4 +1,5 @@
 module.exports = {
+  mycmd: require("./mycmd"),
```

From there, you should see it in the help screen:
```shell
$ cd packages/susyknot-core
$ node cli.js
Susyknot v5.0.0-beta.1 - a development framework for Sophon

Usage: susyknot <command> [options]

Commands:
  mycmd     Run mycmd
  build     Execute build pipeline (if configuration present)
[...]
```

### Write your module/command

The setup is done, you can now write your command and organize your module as you want in: `packages/susyknot-mycmd/`. You can have a look at `packages/susyknot-box/` which is a good starting example to follow.
