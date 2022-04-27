/**
 * This is a workaround for the following issue:
 * https://github.com/stryker-mutator/stryker-js/issues/3480
 *
 * Rename this file to .babelrc.js when you want to run mutation tests with stryker.
 * This disables Next.js's build using SWC which affects build times: https://nextjs.org/docs/messages/swc-disabled
 **/

module.exports = {
  presets: ["@babel/preset-react", "@babel/preset-typescript"],
  plugins: [],
};
