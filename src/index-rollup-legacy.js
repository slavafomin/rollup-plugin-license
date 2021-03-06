/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016-2018 Mickael Jeanroy
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

const _ = require('lodash');
const LicensePlugin = require('./license-plugin.js');

module.exports = (options = {}) => {
  const plugin = new LicensePlugin(options);

  return {
    /**
     * Name of the plugin, used automatically by rollup.
     * @type {string}
     */
    name: plugin.name,

    /**
     * Function called by rollup when a JS file is loaded: it is used to scan
     * third-party dependencies.
     *
     * @param {string} id JS file path.
     * @return {void}
     */
    load(id) {
      plugin.scanDependency(id);
    },

    /**
     * Function called by rollup to read global options: if source map parameter
     * is truthy, enable it on the plugin.
     *
     * @param {object} opts Rollup options.
     * @return {void}
     */
    options(opts) {
      if (!opts) {
        return;
      }

      if (_.has(options, 'sourceMap') || _.has(options, 'sourcemap')) {
        // SourceMap has been set on the plugin itself.
        return;
      }

      // Rollup >= 0.48 replace `sourceMap` with `sourcemap`.
      // If `sourcemap` is disabled globally, disable it on the plugin.
      if (opts.sourceMap === false || opts.sourcemap === false) {
        plugin.disableSourceMap();
      }
    },

    /**
     * Function called by rollup when the final bundle is generated: it is used
     * to prepend the banner file on the generated bundle.
     *
     * @param {string} code Bundle content.
     * @param {Object} outputOptions The options for this output.
     * @return {void}
     */
    transformBundle(code, outputOptions = {}) {
      const sourcemap = outputOptions.sourcemap !== false || outputOptions.sourceMap !== false;
      return plugin.prependBanner(code, sourcemap);
    },

    /**
     * Function called by rollup when the final bundle will be written on disk: it
     * is used to generate a file containing a summary of all third-party dependencies
     * with license information.
     *
     * @return {void}
     */
    ongenerate() {
      plugin.exportThirdParties();
    },
  };
};
