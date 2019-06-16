const debug = require("debug")("compile:compilerSupplier");
const requireFromString = require("require-from-string");
const fs = require("fs");
const ora = require("ora");
const originalRequire = require("original-require");
const request = require("request-promise");
const semver = require("semver");
const polcWrap = require("polc/wrapper");
const LoadingStrategy = require("./LoadingStrategy");

class VersionRange extends LoadingStrategy {
  compilerFromString(code) {
    const poljson = requireFromString(code);
    const wrapped = polcWrap(poljson);
    this.removeListener();
    return wrapped;
  }

  findNewestValidVersion(version, allVersions) {
    if (!semver.validRange(version)) return null;
    const satisfyingVersions = Object.keys(allVersions.releases)
      .map(polcVersion => {
        if (semver.satisfies(polcVersion, version)) return polcVersion;
      })
      .filter(polcVersion => polcVersion);
    if (satisfyingVersions.length > 0) {
      return satisfyingVersions.reduce((newestVersion, version) => {
        return semver.gtr(version, newestVersion) ? version : newestVersion;
      }, "0.0.0");
    } else {
      return null;
    }
  }

  getCachedPolcByFileName(fileName) {
    const filePath = this.resolveCache(fileName);
    const poljson = originalRequire(filePath);
    debug("poljson %o", poljson);
    const wrapped = polcWrap(poljson);
    this.removeListener();
    return wrapped;
  }

  // Range can also be a single version specification like "0.5.0"
  getCachedPolcByVersionRange(version) {
    const cachedCompilerFileNames = fs.readdirSync(this.compilerCachePath);
    const validVersions = cachedCompilerFileNames.filter(fileName => {
      const match = fileName.match(/v\d+\.\d+\.\d+.*/);
      if (match) return semver.satisfies(match[0], version);
    });

    const multipleValidVersions = validVersions.length > 1;
    const compilerFileName = multipleValidVersions
      ? this.getMostRecentVersionOfCompiler(validVersions)
      : validVersions[0];
    return this.getCachedPolcByFileName(compilerFileName);
  }

  getCachedPolcFileName(commit) {
    const cachedCompilerFileNames = fs.readdirSync(this.compilerCachePath);
    return cachedCompilerFileNames.find(fileName => {
      return fileName.includes(commit);
    });
  }

  getCommitFromVersion(versionString) {
    return "commit." + versionString.match(/commit\.(.*?)\./)[1];
  }

  getMostRecentVersionOfCompiler(versions) {
    return versions.reduce((mostRecentVersionFileName, fileName) => {
      const match = fileName.match(/v\d+\.\d+\.\d+.*/);
      const mostRecentVersionMatch = mostRecentVersionFileName.match(
        /v\d+\.\d+\.\d+.*/
      );
      return semver.gtr(match[0], mostRecentVersionMatch[0])
        ? fileName
        : mostRecentVersionFileName;
    }, "-v0.0.0+commit");
  }

  getSatisfyingVersionFromCache(versionRange) {
    if (this.versionIsCached(versionRange)) {
      return this.getCachedPolcByVersionRange(versionRange);
    }
    throw this.errors("noVersion", versionRange);
  }

  async getPolcByCommit(commit) {
    const polcFileName = this.getCachedPolcFileName(commit);
    if (polcFileName) return this.getCachedPolcByFileName(polcFileName);

    const allVersions = await this.getPolcVersions();
    const fileName = this.getPolcVersionFileName(commit, allVersions);

    if (!fileName) throw new Error("No matching version found");

    return this.getPolcByUrlAndCache(fileName);
  }

  async getPolcByUrlAndCache(fileName, index = 0) {
    const url = this.config.compilerRoots[index] + fileName;
    const spinner = ora({
      text: "Downloading compiler. Attempt #" + (index + 1),
      color: "red"
    }).start();
    try {
      const response = await request.get(url);
      spinner.stop();
      this.addFileToCache(response, fileName);
      return this.compilerFromString(response);
    } catch (error) {
      spinner.stop();
      if (index >= this.config.compilerRoots.length - 1) {
        throw this.errors("noRequest", "compiler URLs", error);
      }
      return this.getPolcByUrlAndCache(fileName, index + 1);
    }
  }

  async getPolcFromCacheOrUrl(versionConstraint) {
    let allVersions, versionToUse;
    try {
      allVersions = await this.getPolcVersions();
    } catch (error) {
      throw this.errors("noRequest", versionConstraint, error);
    }

    const isVersionRange = !semver.valid(versionConstraint);

    versionToUse = isVersionRange
      ? this.findNewestValidVersion(versionConstraint, allVersions)
      : versionConstraint;

    const fileName = this.getPolcVersionFileName(versionToUse, allVersions);
    if (!fileName) throw this.errors("noVersion", versionToUse);

    if (this.fileIsCached(fileName))
      return this.getCachedPolcByFileName(fileName);

    return this.getPolcByUrlAndCache(fileName);
  }

  getPolcVersions(index = 0) {
    const spinner = ora({
      text: "Fetching polc version list from polc-bin. Attempt #" + (index + 1),
      color: "yellow"
    }).start();
    if (!this.config.compilerRoots || this.config.compilerRoots.length < 1)
      throw this.errors("noUrl");
    return request(this.config.compilerRoots[index] + "list.json")
      .then(list => {
        spinner.stop();
        return JSON.parse(list);
      })
      .catch(error => {
        spinner.stop();
        if (index >= this.config.compilerRoots.length - 1) {
          throw this.errors("noRequest", "version URLs", error);
        }
        return this.getPolcVersions(index + 1);
      });
  }

  getPolcVersionFileName(version, allVersions) {
    if (allVersions.releases[version]) return allVersions.releases[version];

    const isPrerelease =
      version.includes("nightly") || version.includes("commit");

    if (isPrerelease) {
      for (let build of allVersions.builds) {
        const exists =
          build["prerelease"] === version ||
          build["build"] === version ||
          build["longVersion"] === version;

        if (exists) return build["path"];
      }
    }

    const versionToUse = this.findNewestValidVersion(version, allVersions);

    if (versionToUse) return allVersions.releases[versionToUse];

    return null;
  }

  async load(versionRange) {
    const rangeIsSingleVersion = semver.valid(versionRange);
    if (rangeIsSingleVersion && this.versionIsCached(versionRange)) {
      return this.getCachedPolcByVersionRange(versionRange);
    }

    try {
      return await this.getPolcFromCacheOrUrl(versionRange);
    } catch (error) {
      if (error.message.includes("Failed to complete request")) {
        return this.getSatisfyingVersionFromCache(versionRange);
      }
      throw new Error(error);
    }
  }

  normalizePolcVersion(input) {
    const version = String(input);
    return version.split(":")[1].trim();
  }

  versionIsCached(version) {
    const cachedCompilerFileNames = fs.readdirSync(this.compilerCachePath);
    const cachedVersions = cachedCompilerFileNames.map(fileName => {
      const match = fileName.match(/v\d+\.\d+\.\d+.*/);
      if (match) return match[0];
    });
    return cachedVersions.find(cachedVersion =>
      semver.satisfies(cachedVersion, version)
    );
  }
}

module.exports = VersionRange;
