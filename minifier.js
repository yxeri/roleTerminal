'use strict';

const fs = require('fs');
const path = require('path');
const htmlMinifier = require('html-minifier');
const minifier = require('node-minify');
const logger = require('./logger');
const serverConfig = require('./config/serverConfig');

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
        removeComments : true,
        removeCommentsFromCDATA : true,
        removeCDATASectionsFromCDATA : true,
        collapseWhitespace : true,
        minifyJS : true,
        minifyCSS : true
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
function nodeMinify(inPath, outPath, minifierType) {
  new minifier.minify({
    type : minifierType,
    fileIn : inPath,
    fileOut : outPath,
    callback : function(err) {
      if (err) {
        logger.sendErrorMsg(logger.ErrorCodes.general, 'Minify error', err);
      }

      logger.sendInfoMsg('Minified ' + inPath);
    }
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
 * Goes through a directory and minifies all files with a specific extension
 * @param {string} inPath Private directory path for the file
 * @param {string} outPath Public directory path for the file
 * @param {string} extension Extension of the file
 * @returns {undefined} Returns undefined
 */
function minifyDir(inPath, outPath, extension) {
  checkDir(outPath, function(err) {
    if (err) {
      console.log(err);
      return;
    }

    fs.readdir(inPath, function(readErr, files) {
      if (readErr) {
        console.log(readErr);
      } else {
        files.forEach(function(file) {
          const fullInPath = path.join(inPath, file);
          const fullOutPath = path.join(outPath, file);

          if (path.extname(file).substr(1) === extension) {
            let type = '';

            if (extension === 'html') {
              htmlMinify(fullInPath, fullOutPath);
            } else if (extension === 'js') {
              type = serverConfig.mode === 'dev' ? 'no-compress' : 'uglifyjs';

              nodeMinify(fullInPath, fullOutPath, type);
            } else if (extension === 'css') {
              type = serverConfig.mode === 'dev' ? 'no-compress' : 'sqwish';

              nodeMinify(fullInPath, fullOutPath, type);
            }
          }
        });
      }
    });
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
    type = serverConfig.mode === 'dev' ? 'no-compress' : 'uglifyjs';

    nodeMinify(filePath, outPath, type);
  } else if (extension === 'css') {
    type = serverConfig.mode === 'dev' ? 'no-compress' : 'sqwish';

    nodeMinify(filePath, outPath, type);
  }
}

exports.minifyDir = minifyDir;
exports.minifyFile = minifyFile;
