const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const webpack = require("webpack");
const pkg = require("./package.json");
const rootDir = path.join(__dirname, "../..");
const outputDir = path.join(__dirname, "build");

module.exports = {
  entry: {
    cli: path.join(
      __dirname,
      "../..",
      "node_modules",
      "susyknot-core",
      "cli.js"
    ),
    chain: path.join(
      __dirname,
      "../..",
      "node_modules",
      "susyknot-core",
      "chain.js"
    ),
    analytics: path.join(
      __dirname,
      "../..",
      "node_modules",
      "susyknot-core",
      "lib",
      "services",
      "analytics",
      "main.js"
    )
  },
  target: "node",
  node: {
    // For this option, see here: https://github.com/webpack/webpack/issues/1599
    __dirname: false,
    __filename: false
  },
  context: rootDir,
  output: {
    path: outputDir,
    filename: "[name].bundled.js"
  },
  devtool: "source-map",
  module: {
    rules: [
      { test: /\.js$/, use: "shebang-loader" },
      { test: /rx\.lite\.aggregates\.js/, use: "imports-loader?define=>false" }
    ]
  },
  externals: [
    // If you look at webpack's docs, `externals` doesn't need to be a function.
    // But I never got it to work otherwise, so this is a function because "it works".
    function(context, request, callback) {
      // susyknot-config uses the original-require module.
      // Here, we leave it as an external, and use the original-require
      // module that's a dependency of Susyknot instead.
      if (/^original-require$/.test(request)) {
        return callback(null, "commonjs original-require");
      }

      // Mocha doesn't seem to bundle well either. This is a stop-gap until
      // I can look into it further.
      if (/^mocha$/.test(request)) {
        return callback(null, "commonjs mocha");
      }

      callback();
    }
  ],
  plugins: [
    new webpack.DefinePlugin({
      BUNDLE_VERSION: JSON.stringify(pkg.version),
      BUNDLE_CHAIN_FILENAME: JSON.stringify("chain.bundled.js"),
      BUNDLE_ANALYTICS_FILENAME: JSON.stringify("analytics.bundled.js")
    }),

    // Put the shebang back on.
    new webpack.BannerPlugin({ banner: "#!/usr/bin/env node\n", raw: true }),

    // `susyknot test`
    new CopyWebpackPlugin([
      {
        from: path.join(
          __dirname,
          "../..",
          "node_modules",
          "susyknot-core",
          "lib",
          "testing",
          "Assert.pol"
        )
      },
      {
        from: path.join(
          __dirname,
          "../..",
          "node_modules",
          "susyknot-core",
          "lib",
          "testing",
          "AssertAddress.pol"
        )
      },
      {
        from: path.join(
          __dirname,
          "../..",
          "node_modules",
          "susyknot-core",
          "lib",
          "testing",
          "AssertAddressArray.pol"
        )
      },
      {
        from: path.join(
          __dirname,
          "../..",
          "node_modules",
          "susyknot-core",
          "lib",
          "testing",
          "AssertAddressPayableArray.pol"
        )
      },
      {
        from: path.join(
          __dirname,
          "../..",
          "node_modules",
          "susyknot-core",
          "lib",
          "testing",
          "AssertBalance.pol"
        )
      },
      {
        from: path.join(
          __dirname,
          "../..",
          "node_modules",
          "susyknot-core",
          "lib",
          "testing",
          "AssertBool.pol"
        )
      },
      {
        from: path.join(
          __dirname,
          "../..",
          "node_modules",
          "susyknot-core",
          "lib",
          "testing",
          "AssertBytes32.pol"
        )
      },
      {
        from: path.join(
          __dirname,
          "../..",
          "node_modules",
          "susyknot-core",
          "lib",
          "testing",
          "AssertBytes32Array.pol"
        )
      },
      {
        from: path.join(
          __dirname,
          "../..",
          "node_modules",
          "susyknot-core",
          "lib",
          "testing",
          "AssertGeneral.pol"
        )
      },
      {
        from: path.join(
          __dirname,
          "../..",
          "node_modules",
          "susyknot-core",
          "lib",
          "testing",
          "AssertInt.pol"
        )
      },
      {
        from: path.join(
          __dirname,
          "../..",
          "node_modules",
          "susyknot-core",
          "lib",
          "testing",
          "AssertIntArray.pol"
        )
      },
      {
        from: path.join(
          __dirname,
          "../..",
          "node_modules",
          "susyknot-core",
          "lib",
          "testing",
          "AssertString.pol"
        )
      },
      {
        from: path.join(
          __dirname,
          "../..",
          "node_modules",
          "susyknot-core",
          "lib",
          "testing",
          "AssertUint.pol"
        )
      },
      {
        from: path.join(
          __dirname,
          "../..",
          "node_modules",
          "susyknot-core",
          "lib",
          "testing",
          "AssertUintArray.pol"
        )
      },
      {
        from: path.join(
          __dirname,
          "../..",
          "node_modules",
          "susyknot-core",
          "lib",
          "testing",
          "NewSafeSend.pol"
        )
      },
      {
        from: path.join(
          __dirname,
          "../..",
          "node_modules",
          "susyknot-core",
          "lib",
          "testing",
          "OldSafeSend.pol"
        )
      },
      {
        from: path.join(
          __dirname,
          "../..",
          "node_modules",
          "susyknot-core",
          "lib",
          "templates/"
        ),
        to: "templates",
        flatten: true
      }
    ]),

    new CleanWebpackPlugin(["build"]),

    // Make susyweb 1.0 packable
    new webpack.IgnorePlugin(/^electron$/)
  ],
  resolve: {
    alias: {
      "ws": path.join(__dirname, "./nil.js"),
      "bn.js": path.join(
        __dirname,
        "../..",
        "node_modules",
        "bn.js",
        "lib",
        "bn.js"
      ),
      "original-fs": path.join(__dirname, "./nil.js"),
      "scrypt": "js-scrypt"
    }
  },
  stats: {
    warnings: false
  }
};
