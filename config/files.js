/* Exports a function which returns an object that overrides the default &
 *   plugin file patterns (used widely through the app configuration)
 *
 * To see the default definitions for Lineman's file paths and globs, see:
 *
 *   - https://github.com/linemanjs/lineman/blob/master/config/files.coffee
 */
module.exports = function(lineman) {
  //Override file patterns here
  return {

    // As an example, to override the file patterns for
    // the order in which to load third party JS libs:
    //
    js: {
      vendor: [
        "vendor/js/underscore.js",
        "vendor/js/jquery.js",
        "vendor/js/bootstrap.js",
        "vendor/js/ramda.js",
        "vendor/js/d3.v3.min.js",
        "vendor/js/highstock.js",
        "vendor/js/standalone-framework.js",
        "vendor/js/**/*.js"
      ],
      app: [
        "app/js/main.js",
        "app/js/**/*.js"
      ],
      minified: "dist/static/js/app.js",
    },
    css: {
        "minified": "dist/static/css/app.css",
    },
  };
};
