const { execSync } = require("child_process");
const LoadingStrategy = require("./LoadingStrategy");
const VersionRange = require("./VersionRange");

class Native extends LoadingStrategy {
  load() {
    const versionString = this.validateAndGetPolcVersion();
    const command = "polc --standard-json";

    try {
      return {
        compile: options => String(execSync(command, { input: options })),
        version: () => versionString
      };
    } catch (error) {
      if (error.message === "No matching version found") {
        throw this.errors("noVersion", versionString);
      }
      throw new Error(error);
    }
  }

  validateAndGetPolcVersion() {
    let version;
    try {
      version = execSync("polc --version");
    } catch (error) {
      throw this.errors("noNative", null, error);
    }
    return new VersionRange().normalizePolcVersion(version);
  }
}

module.exports = Native;
