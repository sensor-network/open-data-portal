const path = require("path");

/**
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */
/*
awaiting stryker to fix compatibility with next's async jest-config: https://github.com/stryker-mutator/stryker-js/issues/3480
module.exports = {
  _comment:
    "This config was generated using 'stryker init'. Please take a look at: https://stryker-mutator.io/docs/stryker-js/configuration/ for more information",
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress"],
  testRunner: "jest",
  jest: {
    projectType: "custom",
    configFile: path.resolve(__dirname, "jest.config.js"),
  },
  checkers: ["typescript"],
  coverageAnalysis: "perTest",
  tsconfigFile: "tsconfig.json",
};
*/

/**
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */
module.exports = {
  _comment:
    "This config was generated using 'stryker init'. Please take a look at: https://stryker-mutator.io/docs/stryker-js/configuration/ for more information",
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress"],
  testRunner: "command",
  coverageAnalysis: "perTest",
};
