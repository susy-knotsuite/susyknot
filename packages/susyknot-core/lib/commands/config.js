const command = {
  command: "config",
  description: "Set user-level configuration options",
  help: {
    usage: "susyknot config <option>",
    options: [
      {
        option: "--enable-analytics",
        description: "Enable Susyknot to send usage data to Google Analytics"
      },
      {
        option: "--disable-analytics",
        description:
          "Disable Susyknot's ability to send usage data to Google Analytics"
      }
    ]
  },
  builder: {},
  /**
   * run config commands to set user-level config settings
   * @param {Object} options
   * @param {Func} callback
   */
  run: function(options, done) {
    const googleAnalytics = require("../services/analytics/google.js");
    let setAnalytics;
    if (options.enableAnalytics) {
      setAnalytics = googleAnalytics.setAnalytics(true);
      done();
    } else if (options.disableAnalytics) {
      setAnalytics = googleAnalytics.setAnalytics(false);
      done();
    } else {
      setAnalytics = googleAnalytics.setUserConfigViaPrompt();
      setAnalytics.then(() => done()).catch(err => err);
    }
  }
};

module.exports = command;
