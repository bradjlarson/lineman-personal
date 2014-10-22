/* Exports a function which returns an object that overrides the default &
 *   plugin grunt configuration object.
 *
 * You can familiarize yourself with Lineman's defaults by checking out:
 *
 *   - https://github.com/linemanjs/lineman/blob/master/config/application.coffee
 *   - https://github.com/linemanjs/lineman/blob/master/config/plugins
 *
 * You can also ask Lineman's about config from the command line:
 *
 *   $ lineman config #=> to print the entire config
 *   $ lineman config concat_sourcemap.js #=> to see the JS config for the concat task.
 */
module.exports = function(lineman) {
  //Override application configuration here. Common examples follow in the comments.
  return {

    // API Proxying
    //
    // During development, you'll likely want to make XHR (AJAX) requests to an API on the same
    // port as your lineman development server. By enabling the API proxy and setting the port, all
    // requests for paths that don't match a static asset in ./generated will be forwarded to
    // whatever service might be running on the specified port.
    //
    server: {
      apiProxy: {
        enabled: false,
        //host: 'localhost',
        //port: 31415
       }
    },

    // Sass
    //
    // Lineman supports Sass via grunt-contrib-sass, which requires you first
    // have Ruby installed as well as the `sass` gem. To enable it, comment out the
    // following line:
    //
    // enableSass: true

    // Asset Fingerprints
    //
    // Lineman can fingerprint your static assets by appending a hash to the filename
    // and logging a manifest of logical-to-hashed filenames in dist/assets.json
    // via grunt-asset-fingerprint
    //
    // enableAssetFingerprint: true

    // LiveReload
    //
    // Lineman can LiveReload browsers whenever a file is changed that results in
    // assets to be processed, preventing the need to hit F5/Cmd-R every time you
    // make a change in each browser you're working against. To enable LiveReload,
    // comment out the following line:
    //
    livereload: true,
    "assetFingerprint": {
      "options": {
        "manifestPath": "<%= files.assetFingerprint.manifest %>",
        "findAndReplaceFiles": "<%= files.assetFingerprint.textFiles %>",
        "keepOriginalFiles": false
      },
      "dist": {
        "files": [
          {
            "expand": true,
            "cwd": "dist",
            "src": [
              "<%= files.img.root %>/**/*",
              "<%= files.webfonts.root %>/**/*",
              "<%= files.js.minifiedWebRelative %>",
              "<%= files.css.minifiedWebRelative %>"
            ],
            "dest": "dist/static"
          }
        ]
      }
    }, 
    "copy" : {
      "dist": {
        "files": [
          {
            "expand": true,
            "cwd": "vendor/static",
            "src": "**",
            "dest": "dist/static"
          },
          {
            "expand": true,
            "cwd": "app/static",
            "src": "**",
            "dest": "dist/static"
          }
        ]
      }
    },
    "images": {
      "files": {
        "app/img/": "<%= files.img.app %>",
        "vendor/img/": "<%= files.img.vendor %>"
      },
      "root": "<%= files.img.root %>",
      "dev": {
        "dest": "generated"
      },
      "dist": {
        "dest": "dist/static"
      }
    },
    "webfonts": {
      "files": {
        "vendor/webfonts/": "<%= files.webfonts.vendor %>"
      },
      "root": "<%= files.webfonts.root %>",
      "dev": {
        "dest": "generated"
      },
      "dist": {
        "dest": "dist/static"
      }
    },
    "pages": {
      "dist": {
        "files": {
          "dist/static": "<%= files.pages.source %>",
          "dist/static/index.html": "app/templates/homepage.*"
        },
        "context": {
          "js": "/js/app.js",
          "css": "/css/app.css"
        }
      }
    },
  };
};
