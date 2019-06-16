const assert = require("assert");
const pluginLoader = require("../lib/plugin");
const SusyknotError = require("susyknot-error");
const originalRequire = require("original-require");
const path = require("path");

describe("plugin loader", () => {
  originalRequire("app-module-path").addPath(
    path.resolve(process.cwd(), "test/mockPlugins")
  );

  describe("checkPluginConfig", () => {
    it("throws when passed an options.plugins non-array or empty array value", () => {
      assert.throws(
        () => {
          pluginLoader.checkPluginConfig({ plugins: "string" });
        },
        SusyknotError,
        "SusyknotError not thrown!"
      );
      assert.throws(
        () => {
          pluginLoader.checkPluginConfig({ plugins: 1234 });
        },
        SusyknotError,
        "SusyknotError not thrown!"
      );
      assert.throws(
        () => {
          pluginLoader.checkPluginConfig({ plugins: { foo: "bar" } });
        },
        SusyknotError,
        "SusyknotError not thrown!"
      );
      assert.throws(
        () => {
          pluginLoader.checkPluginConfig({ plugins: [] });
        },
        SusyknotError,
        "SusyknotError not thrown!"
      );
      assert.throws(
        () => {
          pluginLoader.checkPluginConfig({ plugins: null });
        },
        SusyknotError,
        "SusyknotError not thrown!"
      );
      assert.throws(
        () => {
          pluginLoader.checkPluginConfig({ plugins: undefined });
        },
        SusyknotError,
        "SusyknotError not thrown!"
      );
    });

    it("returns options when passed a valid options.plugins array value", () => {
      assert(pluginLoader.checkPluginConfig({ plugins: ["susyknot-test"] }));
      let pluginOptions = pluginLoader.checkPluginConfig({
        plugins: ["susyknot-test"]
      });
      assert(pluginOptions);
      assert.deepEqual(pluginOptions, { plugins: ["susyknot-test"] });

      assert(
        pluginLoader.checkPluginConfig({
          plugins: ["susyknot-test", "susyknot-analyze"]
        })
      );
      pluginOptions = pluginLoader.checkPluginConfig({
        plugins: ["susyknot-test", "susyknot-analyze"]
      });
      assert(pluginOptions);
      assert.deepEqual(pluginOptions, {
        plugins: ["susyknot-test", "susyknot-analyze"]
      });
    });
  });

  describe("checkPluginModules", () => {
    it("throws when options.plugins are specified but not locally or globally installed", () => {
      assert.throws(
        () => {
          pluginLoader.checkPluginModules({
            plugins: ["susyknot-analyze"],
            working_directory: process.cwd()
          });
        },
        SusyknotError,
        "SusyknotError not thrown!"
      );
      assert.throws(
        () => {
          pluginLoader.checkPluginModules({
            plugins: ["susyknot-analyze", "susyknot-test"],
            working_directory: process.cwd()
          });
        },
        SusyknotError,
        "SusyknotError not thrown!"
      );
    });

    it("returns array of locally or globally installed options.plugins", () => {
      assert(
        pluginLoader.checkPluginModules({
          plugins: ["susyknot-box"],
          working_directory: process.cwd()
        })
      );
      let pluginArray = pluginLoader.checkPluginModules({
        plugins: ["susyknot-box"],
        working_directory: process.cwd()
      });
      assert(pluginArray);
      assert(Array.isArray(pluginArray) && pluginArray.length === 1);

      assert(
        pluginLoader.checkPluginModules({
          plugins: ["susyknot-box", "susyknot-config"],
          working_directory: process.cwd()
        })
      );
      pluginArray = pluginLoader.checkPluginModules({
        plugins: ["susyknot-box", "susyknot-config"],
        working_directory: process.cwd()
      });
      assert(pluginArray);
      assert(Array.isArray(pluginArray) && pluginArray.length === 2);
    });
  });

  describe("loadPluginModules", () => {
    it("throws when plugins are installed without a susyknot-plugin.json configuration file", () => {
      assert.throws(
        () => {
          pluginLoader.loadPluginModules(["susyknot-box"]);
        },
        SusyknotError,
        "SusyknotError not thrown!"
      );
      assert.throws(
        () => {
          pluginLoader.loadPluginModules(["susyknot-box", "susyknot-config"]);
        },
        SusyknotError,
        "SusyknotError not thrown!"
      );
    });

    it("returns object of plugins installed with the susyknot-plugin.json file loaded", () => {
      assert(pluginLoader.loadPluginModules(["susyknot-mock"]));
      let pluginObj = pluginLoader.loadPluginModules(["susyknot-mock"]);
      assert(pluginObj);
      assert(typeof pluginObj === "object");
      let pluginConfig = originalRequire("susyknot-mock/susyknot-plugin.json");
      assert(pluginConfig === pluginObj["susyknot-mock"]);

      assert(
        pluginLoader.loadPluginModules(["susyknot-mock", "susyknot-other-mock"])
      );
      pluginObj = pluginLoader.loadPluginModules([
        "susyknot-mock",
        "susyknot-other-mock"
      ]);
      assert(pluginObj);
      assert(typeof pluginObj === "object");
      pluginConfig = originalRequire("susyknot-other-mock/susyknot-plugin.json");
      assert(pluginConfig === pluginObj["susyknot-other-mock"]);
    });
  });
  describe("load", () => {
    describe("SusyknotError handling", () => {
      it("throws when passed an options.plugins non-array or empty array value", () => {
        assert.throws(
          () => {
            pluginLoader.checkPluginConfig({ plugins: "string" });
          },
          SusyknotError,
          "SusyknotError not thrown!"
        );
        assert.throws(
          () => {
            pluginLoader.checkPluginConfig({ plugins: 1234 });
          },
          SusyknotError,
          "SusyknotError not thrown!"
        );
        assert.throws(
          () => {
            pluginLoader.checkPluginConfig({ plugins: { foo: "bar" } });
          },
          SusyknotError,
          "SusyknotError not thrown!"
        );
        assert.throws(
          () => {
            pluginLoader.checkPluginConfig({ plugins: [] });
          },
          SusyknotError,
          "SusyknotError not thrown!"
        );
        assert.throws(
          () => {
            pluginLoader.checkPluginConfig({ plugins: null });
          },
          SusyknotError,
          "SusyknotError not thrown!"
        );
        assert.throws(
          () => {
            pluginLoader.checkPluginConfig({ plugins: undefined });
          },
          SusyknotError,
          "SusyknotError not thrown!"
        );
      });

      it("throws when options.plugins are specified but not locally or globally installed", () => {
        assert.throws(
          () => {
            pluginLoader.checkPluginModules({
              plugins: ["susyknot-analyze"],
              working_directory: process.cwd()
            });
          },
          SusyknotError,
          "SusyknotError not thrown!"
        );
        assert.throws(
          () => {
            pluginLoader.checkPluginModules({
              plugins: ["susyknot-analyze", "susyknot-test"],
              working_directory: process.cwd()
            });
          },
          SusyknotError,
          "SusyknotError not thrown!"
        );
      });

      it("throws when plugins are installed without a susyknot-plugin.json configuration file", () => {
        assert.throws(
          () => {
            pluginLoader.loadPluginModules(["susyknot-box"]);
          },
          SusyknotError,
          "SusyknotError not thrown!"
        );
        assert.throws(
          () => {
            pluginLoader.loadPluginModules(["susyknot-box", "susyknot-config"]);
          },
          SusyknotError,
          "SusyknotError not thrown!"
        );
      });
    });

    it("returns object of plugins installed & susyknot-plugin.json data when passed a valid options.plugins array", () => {
      assert(
        pluginLoader.load({
          plugins: ["susyknot-mock"],
          working_directory: process.cwd()
        })
      );
      let pluginObj = pluginLoader.load({
        plugins: ["susyknot-mock"],
        working_directory: process.cwd()
      });
      assert(pluginObj);
      assert(typeof pluginObj === "object");
      let pluginConfig = originalRequire("susyknot-mock/susyknot-plugin.json");
      assert(pluginConfig === pluginObj["susyknot-mock"]);

      assert(
        pluginLoader.load({
          plugins: ["susyknot-mock", "susyknot-other-mock"],
          working_directory: process.cwd()
        })
      );
      pluginObj = pluginLoader.load({
        plugins: ["susyknot-mock", "susyknot-other-mock"],
        working_directory: process.cwd()
      });
      assert(pluginObj);
      assert(typeof pluginObj === "object");
      pluginConfig = originalRequire("susyknot-other-mock/susyknot-plugin.json");
      assert(pluginConfig === pluginObj["susyknot-other-mock"]);
    });
  });
});
