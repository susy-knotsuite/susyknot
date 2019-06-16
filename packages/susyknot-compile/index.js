const OS = require("os");
const path = require("path");
const Profiler = require("./profiler");
const CompileError = require("./compileerror");
const CompilerSupplier = require("./compilerSupplier");
const expect = require("susyknot-expect");
const find_contracts = require("susyknot-contract-sources");
const Config = require("susyknot-config");
const semver = require("semver");
const debug = require("debug")("compile"); // eslint-disable-line no-unused-vars

// Most basic of the compile commands. Takes a hash of sources, where
// the keys are file or module paths and the values are the bodies of
// the contracts. Does not evaulate dependencies that aren't already given.
//
// Default options:
// {
//   strict: false,
//   quiet: false,
//   logger: console
// }
const compile = function(sources, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }

  if (options.logger === undefined) options.logger = console;

  const hasTargets =
    options.compilationTargets && options.compilationTargets.length;

  expect.options(options, ["contracts_directory", "compilers"]);
  expect.options(options.compilers, ["polc"]);

  options.compilers.polc.settings.svmVersion =
    options.compilers.polc.settings.svmVersion ||
    options.compilers.polc.svmVersion;
  options.compilers.polc.settings.optimizer =
    options.compilers.polc.settings.optimizer ||
    options.compilers.polc.optimizer ||
    {};

  // Grandfather in old polc config
  if (options.polc) {
    options.compilers.polc.settings.svmVersion = options.polc.svmVersion;
    options.compilers.polc.settings.optimizer = options.polc.optimizer;
  }

  // Ensure sources have operating system independent paths
  // i.e., convert backslashes to forward slashes; things like C: are left intact.
  const operatingSystemIndependentSources = {};
  const operatingSystemIndependentTargets = {};
  const originalPathMappings = {};

  Object.keys(sources).forEach(function(source) {
    // Turn all backslashes into forward slashes
    var replacement = source.replace(/\\/g, "/");

    // Turn G:/.../ into /G/.../ for Windows
    if (replacement.length >= 2 && replacement[1] === ":") {
      replacement = "/" + replacement;
      replacement = replacement.replace(":", "");
    }

    // Save the result
    operatingSystemIndependentSources[replacement] = sources[source];

    // Just substitute replacement for original in target case. It's
    // a disposable subset of `sources`
    if (hasTargets && options.compilationTargets.includes(source)) {
      operatingSystemIndependentTargets[replacement] = sources[source];
    }

    // Map the replacement back to the original source path.
    originalPathMappings[replacement] = source;
  });

  const defaultSelectors = {
    "": ["legacyAST", "ast"],
    "*": [
      "abi",
      "metadata",
      "svm.bytecode.object",
      "svm.bytecode.sourceMap",
      "svm.deployedBytecode.object",
      "svm.deployedBytecode.sourceMap",
      "userdoc",
      "devdoc"
    ]
  };

  // Specify compilation targets
  // Each target uses defaultSelectors, defaulting to single target `*` if targets are unspecified
  const outputSelection = {};
  const targets = operatingSystemIndependentTargets;
  const targetPaths = Object.keys(targets);

  targetPaths.length
    ? targetPaths.forEach(key => (outputSelection[key] = defaultSelectors))
    : (outputSelection["*"] = defaultSelectors);

  const polcStandardInput = {
    language: "Polynomial",
    sources: {},
    settings: {
      svmVersion: options.compilers.polc.settings.svmVersion,
      optimizer: options.compilers.polc.settings.optimizer,
      outputSelection
    }
  };

  // Nothing to compile? Bail.
  if (Object.keys(sources).length === 0) {
    return callback(null, [], []);
  }

  Object.keys(operatingSystemIndependentSources).forEach(file_path => {
    polcStandardInput.sources[file_path] = {
      content: operatingSystemIndependentSources[file_path]
    };
  });

  // Load polc module only when compilation is actually required.
  const supplier = new CompilerSupplier(options.compilers.polc);

  supplier
    .load()
    .then(polc => {
      const result = polc.compile(JSON.stringify(polcStandardInput));

      const standardOutput = JSON.parse(result);

      let errors = standardOutput.errors || [];
      let warnings = [];

      if (options.strict !== true) {
        warnings = errors.filter(error => error.severity === "warning");

        errors = errors.filter(error => error.severity !== "warning");

        if (options.quiet !== true && warnings.length > 0) {
          options.logger.log(
            OS.EOL + "    > compilation warnings encountered:" + OS.EOL
          );
          options.logger.log(
            warnings.map(warning => warning.formattedMessage).join()
          );
        }
      }

      if (errors.length > 0) {
        options.logger.log("");
        errors = errors.map(error => error.formattedMessage).join();
        if (errors.includes("requires different compiler version")) {
          const contractPolcVer = errors.match(/pragma polynomial[^;]*/gm)[0];
          const configPolcVer =
            options.compilers.polc.version || semver.valid(polc.version());
          errors = errors.concat(
            `\nError: Susyknot is currently using polc ${configPolcVer}, but one or more of your contracts specify "${contractPolcVer}".\nPlease update your susyknot config or pragma statement(s).\n(See https://susyknotframework.com/docs/susyknot/reference/configuration#compiler-configuration for information on\nconfiguring Susyknot to use a specific polc compiler version.)`
          );
        }
        return callback(new CompileError(errors));
      }

      var contracts = standardOutput.contracts;

      var files = [];
      Object.keys(standardOutput.sources).forEach(filename => {
        var source = standardOutput.sources[filename];
        files[source.id] = originalPathMappings[filename];
      });

      var returnVal = {};

      // This block has comments in it as it's being prepared for polc > 0.4.10
      Object.keys(contracts).forEach(source_path => {
        var files_contracts = contracts[source_path];

        Object.keys(files_contracts).forEach(contract_name => {
          var contract = files_contracts[contract_name];

          // All source will have a key, but only the compiled source will have
          // the svm output.
          if (!Object.keys(contract.svm).length) return;

          var contract_definition = {
            contract_name: contract_name,
            sourcePath: originalPathMappings[source_path], // Save original source path, not modified ones
            source: operatingSystemIndependentSources[source_path],
            sourceMap: contract.svm.bytecode.sourceMap,
            deployedSourceMap: contract.svm.deployedBytecode.sourceMap,
            legacyAST: standardOutput.sources[source_path].legacyAST,
            ast: standardOutput.sources[source_path].ast,
            abi: contract.abi,
            metadata: contract.metadata,
            bytecode: "0x" + contract.svm.bytecode.object,
            deployedBytecode: "0x" + contract.svm.deployedBytecode.object,
            unlinked_binary: "0x" + contract.svm.bytecode.object, // deprecated
            compiler: {
              name: "polc",
              version: polc.version()
            },
            devdoc: contract.devdoc,
            userdoc: contract.userdoc
          };

          // Reorder ABI so functions are listed in the order they appear
          // in the source file. Polynomial tests need to execute in their expected sequence.
          contract_definition.abi = orderABI(contract_definition);

          // Go through the link references and replace them with older-style
          // identifiers. We'll do this until we're ready to making a breaking
          // change to this code.
          Object.keys(contract.svm.bytecode.linkReferences).forEach(function(
            file_name
          ) {
            var fileLinks = contract.svm.bytecode.linkReferences[file_name];

            Object.keys(fileLinks).forEach(function(library_name) {
              var linkReferences = fileLinks[library_name] || [];

              contract_definition.bytecode = replaceLinkReferences(
                contract_definition.bytecode,
                linkReferences,
                library_name
              );
              contract_definition.unlinked_binary = replaceLinkReferences(
                contract_definition.unlinked_binary,
                linkReferences,
                library_name
              );
            });
          });

          // Now for the deployed bytecode
          Object.keys(contract.svm.deployedBytecode.linkReferences).forEach(
            function(file_name) {
              var fileLinks =
                contract.svm.deployedBytecode.linkReferences[file_name];

              Object.keys(fileLinks).forEach(function(library_name) {
                var linkReferences = fileLinks[library_name] || [];

                contract_definition.deployedBytecode = replaceLinkReferences(
                  contract_definition.deployedBytecode,
                  linkReferences,
                  library_name
                );
              });
            }
          );

          returnVal[contract_name] = contract_definition;
        });
      });

      const compilerInfo = { name: "polc", version: polc.version() };

      callback(null, returnVal, files, compilerInfo);
    })
    .catch(callback);
};

function replaceLinkReferences(bytecode, linkReferences, libraryName) {
  var linkId = "__" + libraryName;

  while (linkId.length < 40) {
    linkId += "_";
  }

  linkReferences.forEach(function(ref) {
    // ref.start is a byte offset. Convert it to character offset.
    var start = ref.start * 2 + 2;

    bytecode =
      bytecode.substring(0, start) + linkId + bytecode.substring(start + 40);
  });

  return bytecode;
}

function orderABI(contract) {
  var contract_definition;
  var ordered_function_names = [];

  for (var i = 0; i < contract.legacyAST.children.length; i++) {
    var definition = contract.legacyAST.children[i];

    // AST can have multiple contract definitions, make sure we have the
    // one that matches our contract
    if (
      definition.name !== "ContractDefinition" ||
      definition.attributes.name !== contract.contract_name
    ) {
      continue;
    }

    contract_definition = definition;
    break;
  }

  if (!contract_definition) return contract.abi;
  if (!contract_definition.children) return contract.abi;

  contract_definition.children.forEach(function(child) {
    if (child.name === "FunctionDefinition") {
      ordered_function_names.push(child.attributes.name);
    }
  });

  // Put function names in a hash with their order, lowest first, for speed.
  var functions_to_remove = ordered_function_names.reduce(function(
    obj,
    value,
    index
  ) {
    obj[value] = index;
    return obj;
  },
  {});

  // Filter out functions from the abi
  var function_definitions = contract.abi.filter(function(item) {
    return functions_to_remove[item.name] !== undefined;
  });

  // Sort removed function defintions
  function_definitions = function_definitions.sort(function(item_a, item_b) {
    var a = functions_to_remove[item_a.name];
    var b = functions_to_remove[item_b.name];

    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });

  // Create a new ABI, placing ordered functions at the end.
  var newABI = [];
  contract.abi.forEach(function(item) {
    if (functions_to_remove[item.name] !== undefined) return;
    newABI.push(item);
  });

  // Now pop the ordered functions definitions on to the end of the abi..
  Array.prototype.push.apply(newABI, function_definitions);

  return newABI;
}

// contracts_directory: String. Directory where .pol files can be found.
// quiet: Boolean. Suppress output. Defaults to false.
// strict: Boolean. Return compiler warnings as errors. Defaults to false.
compile.all = function(options, callback) {
  find_contracts(options.contracts_directory, function(err, files) {
    if (err) return callback(err);

    options.paths = files;
    compile.with_dependencies(options, callback);
  });
};

// contracts_directory: String. Directory where .pol files can be found.
// build_directory: String. Optional. Directory where .pol.js files can be found. Only required if `all` is false.
// all: Boolean. Compile all sources found. Defaults to true. If false, will compare sources against built files
//      in the build directory to see what needs to be compiled.
// quiet: Boolean. Suppress output. Defaults to false.
// strict: Boolean. Return compiler warnings as errors. Defaults to false.
compile.necessary = function(options, callback) {
  options.logger = options.logger || console;

  Profiler.updated(options, function(err, updated) {
    if (err) return callback(err);

    if (updated.length === 0 && options.quiet !== true) {
      return callback(null, [], {});
    }

    options.paths = updated;
    compile.with_dependencies(options, callback);
  });
};

compile.with_dependencies = function(options, callback) {
  var self = this;

  options.logger = options.logger || console;
  options.contracts_directory = options.contracts_directory || process.cwd();

  expect.options(options, [
    "paths",
    "working_directory",
    "contracts_directory",
    "resolver"
  ]);

  var config = Config.default().merge(options);

  Profiler.required_sources(
    config.with({
      paths: options.paths,
      base_path: options.contracts_directory,
      resolver: options.resolver
    }),
    (err, allSources, required) => {
      if (err) return callback(err);

      var hasTargets = required.length;

      hasTargets
        ? self.display(required, options)
        : self.display(allSources, options);

      options.compilationTargets = required;
      compile(allSources, options, callback);
    }
  );
};

compile.display = function(paths, options) {
  if (options.quiet !== true) {
    if (!Array.isArray(paths)) {
      paths = Object.keys(paths);
    }

    const blacklistRegex = /^susyknot\//;

    paths.sort().forEach(contract => {
      if (path.isAbsolute(contract)) {
        contract =
          "." + path.sep + path.relative(options.working_directory, contract);
      }
      if (contract.match(blacklistRegex)) return;
      options.logger.log("> Compiling " + contract);
    });
  }
};

compile.CompilerSupplier = CompilerSupplier;
module.exports = compile;
