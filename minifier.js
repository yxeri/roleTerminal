'use strict';

const fs = require('fs');
const path = require('path');
const htmlMinifier = require('html-minifier');
const logger = require('./logger');
const appConfig = require('rolehaven-config').app;
const browserify = require('browserify');
const UglifyJs = require('uglify-js');
const sass = require('node-sass');

/**
 * Minifies a HTML file
 * @param {string} inPath Private directory path for the file
 * @param {string} outPath Public directory path for the file
 * @returns {undefined} Returns undefined
 */
function htmlMinify(inPath, outPath) {
  fs.readFile(inPath, 'utf8', function(readError, readFile) {
    if (readError) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.general,
        text: ['ReadError'],
        err: readError,
      });
    } else {
      const minifyConfig = {
        removeComments: true,
        removeCommentsFromCDATA: true,
        removeCDATASectionsFromCDATA: true,
        collapseWhitespace: true,
        minifyJS: true,
        minifyCSS: true,
      };

      fs.writeFile(outPath, htmlMinifier.minify(readFile, minifyConfig),
        function(writeError) {
          if (writeError) {
            logger.sendErrorMsg({
              code: logger.ErrorCodes.general,
              text: ['WriteError'],
              err: writeError,
            });
          }
        });
    }
  });
}

function jsMinify(inPath, outPath) {
  const transpilePath = inPath + '-transpile';
  let file;

  browserify(inPath, { debug: true }).transform('babelify', { presets: ['es2015'], compact: false }).bundle().pipe(
    file = fs.createWriteStream(transpilePath)
  );

  file.on('finish', function() {
    console.log(`Transpiled to ${transpilePath}`);

    const stream = fs.createWriteStream(outPath);

    stream.once('open', function() {
      if (appConfig.mode !== 'dev') {
        stream.write(UglifyJs.minify(transpilePath).code);
        console.log(`Minified to ${outPath}`);
      } else {
        fs.createReadStream(transpilePath).pipe(fs.createWriteStream(outPath));
        console.log(`Moved to ${outPath}`);
      }

      stream.end();

      fs.stat(transpilePath, function(err) {
        if (err) {
          console.log('Failed to open temp file to remove');

          return;
        }

        fs.unlink(transpilePath, function(unlinkErr) {
          if (unlinkErr) {
            console.log('Failed to remove temp file');

            return;
          }

          console.log('Successfully removed', transpilePath);
        });
      });
    });
  });
}

function cssMinify(inPath, outPath) {
  const cssPath = outPath.replace('.scss', '.css');

  sass.render({
    file: inPath,
  }, function(err, result) {
    if (err || result === null) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.general,
        text: [
          'Failed to render scss',
          inPath,
        ],
        err: err,
      });

      return;
    }

    fs.writeFile(cssPath, result.css, function(writeErr) {
      if (writeErr) {
        logger.sendErrorMsg({
          code: logger.ErrorCodes.general,
          text: [
            'Failed to write css',
            cssPath,
          ],
          err: writeErr,
        });

        return;
      }

      logger.sendInfoMsg(`Wrote ${cssPath}`);
    });
  });
}

/**
 * Checks if the directory on a specific path exists.
 * Creates it if it doesn't exist
 * @param {string} dirPath Directory path to check
 * @param {function} callback Callback
 * @returns {undefined} Returns undefined
 */
function checkDir(dirPath, callback) {
  fs.stat(dirPath, function(err) {
    if (err) {
      fs.mkdir(dirPath, function(dirErr) {
        if (dirErr) {
          logger.sendErrorMsg({
            code: logger.ErrorCodes.general,
            text: ['Mkdir error'],
            err: dirErr,
          });

          return;
        }

        callback(dirErr);
      });
    } else {
      callback(err);
    }
  });
}

/**
 * Minifies a file by calling the correct funtion based on its extension
 * @param {string} filePath File path
 * @param {string} outPath Directory path where the minified file will be moved to
 * @returns {undefined} Returns undefined
 */
function minifyFile(filePath, outPath) {
  const extension = path.extname(filePath).substr(1);

  if (extension === 'html') {
    htmlMinify(filePath, outPath);
  } else if (extension === 'js') {
    jsMinify(filePath, outPath);
  } else if (extension === 'scss') {
    cssMinify(filePath, outPath);
  }
}

// TODO Use logger instead of console.log
/**
 * Goes through a directory and minifies all files with a specific extension
 * @param {string} pathObj Contaisn public (.publicPath) and private (.privatePath) directory path for the file
 * @param {string} extension Extension of the file
 * @returns {undefined} Returns undefined
 */
function minifyDir(pathObj, extension) {
  checkDir(pathObj.publicPath, function(err) {
    if (err) {
      console.log(err);

      return;
    }

    fs.readdir(pathObj.privatePath, function(readErr, files) {
      if (readErr) {
        console.log(readErr);

        return;
      }

      files.forEach(function(file) {
        const fullInPath = path.join(pathObj.privatePath, file);
        const fullOutPath = path.join(pathObj.publicPath, file);

        if (path.extname(file).substr(1) === extension) {
          minifyFile(fullInPath, fullOutPath);
        }
      });
    });
  });
}

exports.minifyDir = minifyDir;
exports.minifyFile = minifyFile;
