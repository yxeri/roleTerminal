'use strict';

let modifiedConfig = {};

try {
  modifiedConfig = require('../modified/appConfig').config;
} catch (err) {
  console.log('Did not find modified appConfig. Using defaults');
}

function convertToBoolean(envar) {
  if (envar === 'true') {
    return true;
  } else if (envar === 'false') {
    return false;
  }

  return undefined;
}

/*
 * All app specific configuration
 */

const config = {};
const userVerifyEnv = convertToBoolean(process.env.REQUIREVERIFY);
const revealFailedHackEnv = convertToBoolean(process.env.REVEALFAILEDHACK);
const forceFullscreenEnv = convertToBoolean(process.env.FORCEFULLSCREEN);
const gpsTrackingEnv = convertToBoolean(process.env.GPSTRACKING);
const teamVerifyEnv = convertToBoolean(process.env.REQUIRETEAMVERIFY);
const disableCommandsEnv = convertToBoolean(process.env.DISABLECOMMANDS);
const hideRoomNamesEnv = convertToBoolean(process.env.HIDEROOMNAMES);
const hideTimeStampEnv = convertToBoolean(process.env.HIDETIMESTAMP);
const staticInputStartEnv = convertToBoolean(process.env.STATICINPUTSTART);

// Title of the site
config.title = process.env.TITLE || modifiedConfig.title || 'roleHaven';

/**
 * Default language for clients connecting.
 * Default language is English.
 * Don't set this var if you want English to be the default language.
 * Valid options: se
 */
config.defaultLanguage = process.env.DEFAULTLANGUAGE || modifiedConfig.defaultLanguage || '';

/*
 * Base directory for public and private files
 */
config.publicBase = process.env.PUBLICBASE || modifiedConfig.publicBase || 'public';
config.privateBase = process.env.PRIVATEBASE || modifiedConfig.privateBase || 'private';

/*
 * Sub directories for public and private files
 * Will be appended to the base directories
 */
config.viewsPath = process.env.VIEWSPATH || modifiedConfig.viewsPath || 'views';
config.stylesPath = process.env.STYLESPATH || modifiedConfig.stylesPath || 'styles';
config.scriptsPath = process.env.SCRIPTSPATH || modifiedConfig.scriptsPath || 'scripts';
config.requiredPath = process.env.REQUIREDPATH || modifiedConfig.requiredPath || 'required';
config.faviconPath = process.env.FAVICONPATH || modifiedConfig.faviconPath || 'images/favicon.ico';

// Morgan log level
config.logLevel = process.env.LOGLEVEL || modifiedConfig.logLevel || 'tiny';

// Database host name
config.dbHost = process.env.DBHOST || modifiedConfig.dbHost || 'localhost';

// Database port
config.dbPort = process.env.DBPORT || modifiedConfig.dbPort || 27017;

// Database database name
config.dbName = process.env.DBNAME || modifiedConfig.dbName || 'roleHaven';

// Node server port number
config.port = process.env.PORT || modifiedConfig.port || 8888;

/*
 * Retrieve socket.io from local server or cdn
 * Note! Android 2.2 fails when using cdn
 */
config.socketPath = (process.env.SOCKETPATH === 'cdn' || modifiedConfig.socketPath === 'cdn') ?
  'https://cdn.socket.io/socket.io-1.4.5.js' : (process.env.SOCKETPATH || modifiedConfig.socketPath || '/scripts/socket.io-1.4.5.js');

/**
 * Server mode. Options:
 * prod, dev
 */
config.mode = process.env.MODE || modifiedConfig.mode || 'prod';

/**
 * Array of route paths
 * Should contain objects of site and file paths
 * sitePath : REQUESTPATH
 * filePath : ROUTEFILE
 *
 * Example:
 * {
 *   sitePath : '*',
 *   filePath : './routes/index.js'
 * }
 */
config.routes = modifiedConfig.routes || [
  {
    sitePath: '/',
    filePath: './routes/index.js',
  }, {
    sitePath: '*',
    filePath: './routes/error.js',
  },
];

/**
 * Custom set of flags to be used on the client
 */
config.customFlags = modifiedConfig.customFlags;

//
// Instance specific
//

config.radioChannels = modifiedConfig.radioChannels || {};

config.gMapsKey = process.env.GMAPSKEY || modifiedConfig.gMapsKey;
config.mapLayersPath = process.env.MAPLAYERSPATH || modifiedConfig.mapLayersPath || 'https://www.google.com/maps/d/kml?hl=en_US&app=mp&mid=1j97gNHqYj-6M10RbW9CGAVNxUV4&forcekml=1&cid=mp&cv=jm93Tu_hxIY.en_US.';

config.country = process.env.COUNTRY || modifiedConfig.country || 'Sweden';
config.centerLat = parseFloat(process.env.CENTERLAT || modifiedConfig.centerLat || 59.3534372);
config.centerLong = parseFloat(process.env.CENTERLONG || modifiedConfig.centerLong || 18.0044666);
config.cornerOneLat = parseFloat(process.env.CORNERONELAT || modifiedConfig.cornerOneLat || 67.3926316);
config.cornerOneLong = parseFloat(process.env.CORNERONELONG || modifiedConfig.cornerOneLong || 24.0936037);
config.cornerTwoLat = parseFloat(process.env.CORNERTWOLAT || modifiedConfig.cornerTwoLat || 55.699443);
config.cornerTwoLong = parseFloat(process.env.CORNERTWOLONG || modifiedConfig.cornerTwoLong || 10.3777913);
config.defaultZoomLevel = parseInt(process.env.DEFAULTZOOMLEVEL || modifiedConfig.defaultZoomLevel || 15, 10);

// Amount of messages retrieved with the history command
config.historyLines = process.env.MAXHISTORY || modifiedConfig.historyLines || 80;

// Amount of messages sent at a time to client
config.chunkLength = process.env.MAXCHUNK || modifiedConfig.chunkLength || 10;

// Does the user have to be verified before being able to login?
config.userVerify = userVerifyEnv !== undefined ? userVerifyEnv : modifiedConfig.userVerify;

if (config.userVerify === undefined) {
  config.userVerify = false;
}

// Does the team have to be verified before being created?
config.teamVerify = teamVerifyEnv !== undefined ? teamVerifyEnv : modifiedConfig.teamVerify;

if (config.teamVerify === undefined) {
  config.teamVerify = false;
}

/**
 * Appended to the user name to create a room which is used to store private
 * messages sent to a user (e.g user1-whisper)
 */
config.whisperAppend = '-whisper';

/**
 * Appended to device ID to create a room which is used to store messages
 * sent to a device (e.g fe3Liw19Xz-device)
 */
config.deviceAppend = '-device';

/**
 * Appended to the team name to create a room which is used to chat
 * within the team (e.g skynet-team)
 */
config.teamAppend = '-team';

config.modes = modifiedConfig.modes || {
  command: 'cmd',
  chat: 'chat',
};

/**
 * Default mode for command input.
 * Valid options are: cmd chat
 */
config.defaultMode = process.env.DEFAULTMODE || modifiedConfig.defaultMode || config.modes.command;

/**
 * Should the user that initiated a hack and failed it be revealed to other users?
 */
config.revealFailedHack = revealFailedHackEnv !== undefined ? revealFailedHackEnv : modifiedConfig.revealFailedHack;

if (config.revealFailedHack === undefined) {
  config.revealFailedHack = true;
}

/**
 * The number of years that will be subtracted/added to the current year
 */
config.yearModification = modifiedConfig.yearModification || 0;

/**
 * Should the frontend force full screen on click?
 */
config.forceFullscreen = forceFullscreenEnv !== undefined ? forceFullscreenEnv : modifiedConfig.forceFullscreen;

if (config.forceFullscreen === undefined) {
  config.forceFullscreen = true;
}

/**
 * Should the frontend ask for user tracking?
 */
config.gpsTracking = gpsTrackingEnv !== undefined ? gpsTrackingEnv : modifiedConfig.gpsTracking;

if (config.gpsTracking === undefined) {
  config.gpsTracking = true;
}

/**
 * Should the user be able to use commands in the frontend?
 */
config.disableCommands = disableCommandsEnv !== undefined ? disableCommandsEnv : modifiedConfig.disableCommands;

if (config.disableCommands === undefined) {
  config.disableCommands = false;
}

/**
 * Should room names be hidden in print in the frontend?
 */
config.hideRoomNames = hideRoomNamesEnv !== undefined ? hideRoomNamesEnv : modifiedConfig.hideRoomNames;

if (config.hideRoomNames === undefined) {
  config.hideRoomNames = false;
}

/**
 * Should time stamps be hidden in print in the frontend?
 */
config.hideTimeStamp = hideTimeStampEnv !== undefined ? hideTimeStampEnv : modifiedConfig.hideTimeStamp;

if (config.hideTimeStamp === undefined) {
  config.hideTimeStamp = false;
}

/**
 * Amount of weather reports that will be sent to the client
 */
config.maxWeatherReports = process.env.MAXWEATHERREPORTS || modifiedConfig.maxWeatherReports || 8;

/**
 * Should the input start be static? Normal behaviour is to set input star to the room name that the user is in
 */
config.staticInputStart = staticInputStartEnv !== undefined ? staticInputStartEnv : modifiedConfig.staticInputStart;

/**
 * The string that will be shown in the beginning of the command input
 */
config.defaultInputStart = process.env.DEFAULTINPUTSTART || modifiedConfig.defaultInputStart || 'RAZCMD';

config.signalResetInterval = process.env.SIGNALRESETINTERVAL || modifiedConfig.signalResetInterval || 0;

module.exports = config;
