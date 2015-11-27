'use strict';

const fs = require('fs');
const path = require('path');
const htmlMinifier = require('html-minifier');
const minifier = require('node-minify');
const logger = require('./logger');
const config = require('./config/serverConfig');
const browserify = require('browserify');

/**
 * Minifies a HTML file
 * @param {string} inPath Private directory path for the file
 * @param {string} outPath Public directory path for the file
 * @returns {undefined} Returns undefined
 */
function htmlMinify(inPath, outPath) {
  fs.readFile(inPath, 'utf8', function(readError, readFile) {
    if (readError) {
      logger.sendErrorMsg(logger.ErrorCodes.general, 'ReadError', readError);
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
            logger.sendErrorMsg(logger.ErrorCodes.general, 'WriteError', writeError);
          }
        });
    }
  });
}

/**
 * Minifies Javascript or CSS files
 * @param {string} inPath Private directory path for the file
 * @param {string} outPath Public directory path for the file
 * @param {string} minifierType Type of the file, either js or css
 * @returns {undefined} Returns undefined
 */
function nodeMinify(inPath, outPath, minifierType, extension) {
  function removeTransTemp(filePath) {
    fs.unlink(filePath, function(err) {
      if (err) {
        console.log('Failed to remove temp file');
      } else {
        console.log('Successfully removed', filePath);
      }
    });
  }

  function minify(sourcePath, callback) {
    new minifier.minify({ // eslint-disable-line
      type: minifierType,
      fileIn: sourcePath,
      fileOut: outPath,
      options: ['--mangle', '--compress unsafe=true'],
      callback: function(err) {
        if (err) {
          logger.sendErrorMsg(logger.ErrorCodes.general, 'Minify error', err);
        } else {
          logger.sendInfoMsg('Minified ' + inPath);
        }

        if (callback) {
          callback(sourcePath);
        }
      },
    });
  }

  if (extension === 'js' && config.transpileEs6) {
    const transpilePath = inPath + '-transpile';
    let file;

    browserify(inPath, {debug: true}).transform('babelify', {presets: ['es2015'], compact: false}).bundle().pipe(
      file = fs.createWriteStream(transpilePath)
    );

    file.on('finish', function() {
      console.log('Transpiled ', transpilePath);
      minify(transpilePath, removeTransTemp);
    });
  } else {
    minify(inPath);
  }
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
          logger.sendErrorMsg(logger.ErrorCodes.general, 'Mkdir error', dirErr);
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
  let type = '';

  if (extension === 'html') {
    htmlMinify(filePath, outPath);
  } else if (extension === 'js') {
    type = config.mode === 'dev' ? 'no-compress' : 'uglifyjs';

    nodeMinify(filePath, outPath, type, extension);
  } else if (extension === 'css') {
    type = config.mode === 'dev' ? 'no-compress' : 'sqwish';

    nodeMinify(filePath, outPath, type);
  }
}

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
      } else {
        files.forEach(function(file) {
          const fullInPath = path.join(pathObj.privatePath, file);
          const fullOutPath = path.join(pathObj.publicPath, file);

          if (path.extname(file).substr(1) === extension) {
            minifyFile(fullInPath, fullOutPath);
          }
        });
      }
    });
  });
}

exports.minifyDir = minifyDir;
exports.minifyFile = minifyFile;
