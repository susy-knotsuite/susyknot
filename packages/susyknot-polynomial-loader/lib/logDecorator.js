const chalk = require("chalk");

const Logger = {
  log(msg) {
    // sometimes reporter msg is undefined
    if (msg) console.log(`[SUSYKNOT POLYNOMIAL] ${msg}`);
  },
  error(msg) {
    console.log(chalk.red(`[! SUSYKNOT POLYNOMIAL ERROR] ${msg}`));
  },
  debug(msg) {
    console.debug(chalk.red(`[! SUSYKNOT POLYNOMIAL DEBUGGER] ${msg}`));
  }
};

module.exports = Logger;
