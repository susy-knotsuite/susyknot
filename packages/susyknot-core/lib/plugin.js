const SusyknotError = require("susyknot-error");
const originalRequire = require("original-require");
const flow = require("lodash/fp/flow");
const path = require("path");

const Plugin = {
  // checks for incorrect config.plugins formatting
  checkPluginConfig(options) {
    let plugins = options.plugins;
    if (!Array.isArray(plugins) || plugins.length === 0)
      throw new SusyknotError("\nError: Plugins configured incorrectly.\n");

    return options;
  },

  // checks plugins recursively from options.susyknot_directory
  checkPluginModules(options) {
    originalRequire("app-module-path").addPath(
      path.resolve(options.working_directory, "node_modules")
    );

    // possible TODO: add app-module-path as dependency of originalRequire
    // external interface something like:
    //
    //   originalRequire.addPath("<path-to-susyknot-plugin>")
    //
    // and then make originalRequire handle `path.resolve(..., "node_modules")`

    let plugins = options.plugins;

    plugins.forEach(plugin => {
      try {
        originalRequire.resolve(plugin);
      } catch (_) {
        throw new SusyknotError(
          `\nError: ${plugin} listed as a plugin, but not found in global or local node modules!\n`
        );
      }
    });

    return plugins;
  },

  // loads plugin config files
  loadPluginModules(plugins) {
    let pluginConfigs = {};
    plugins.forEach(plugin => {
      try {
        pluginConfigs[plugin] = originalRequire(
          `${plugin}/susyknot-plugin.json`
        );
      } catch (_) {
        throw new SusyknotError(
          `\nError: susyknot-plugin.json not found in the ${plugin} plugin package!\n`
        );
      }
    });

    return pluginConfigs;
  },

  // returns plugin configs or throws user helpful error
  load(options) {
    let loadPlugins = flow(
      this.checkPluginConfig,
      this.checkPluginModules,
      this.loadPluginModules
    );

    return loadPlugins(options);
  }
};

module.exports = Plugin;
