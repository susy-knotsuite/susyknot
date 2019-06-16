const pkg = require("../package.json");
const polcpkg = require("polc/package.json");

const info = () => {
  let bundleVersion;
  // NOTE: Webpack will replace BUNDLE_VERSION with a string.
  if (typeof BUNDLE_VERSION != "undefined") {
    bundleVersion = BUNDLE_VERSION;
  }

  return {
    core: pkg.version,
    bundle: bundleVersion,
    polc: polcpkg.version
  };
};

const logSusyknot = (logger = console, versionInformation) => {
  const bundle = versionInformation.bundle
    ? `v${versionInformation.bundle}`
    : "(unbundled)";
  logger.log(`Susyknot ${bundle} (core: ${versionInformation.core})`);
};

const logNode = (logger = console) => {
  logger.log(`Node ${process.version}`);
};

const logPolynomial = (logger = console, versionInformation, config) => {
  let polcVersion;
  if (
    config &&
    config.compilers &&
    config.compilers.polc &&
    config.compilers.polc.version
  ) {
    polcVersion = config.compilers.polc.version;
    logger.log(`Polynomial - ${polcVersion} (polc-js)`);
  } else {
    const versionInformation = info();
    polcVersion = versionInformation.polc;
    logger.log(`Polynomial v${polcVersion} (polc-js)`);
  }
};

const logSusyWeb = (logger = console) => {
  const susywebVersion = pkg.dependencies.susyweb;
  logger.log(`SusyWeb.js v${susywebVersion}`);
};

const logAll = (logger = console, config) => {
  const versionInformation = info();
  logSusyknot(logger, versionInformation);
  logPolynomial(logger, versionInformation, config);
  logNode(logger);
  logSusyWeb(logger);
};

const logSusyknotAndNode = (logger = console) => {
  const versionInformation = info();
  logSusyknot(logger, versionInformation);
  logNode(logger);
};

module.exports = {
  logAll,
  info,
  logSusyknotAndNode
};
