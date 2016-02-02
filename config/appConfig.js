'use strict';

const dbDefaults = require('./dbPopDefaults');

/*
 * All app specific configuration
 */

const config = {};

config.gameLocation = {
  country: process.env.COUNTRY || 'Sweden',
  lat: process.env.LATITUDE || '59.751429',
  lon: process.env.LONGITUDE || '15.198645',
};

// Amount of messages retrieved with the history command
config.historyLines = process.env.MAXHISTORY || 80;

// Amount of messages sent at a time to client
config.chunkLength = process.env.MAXCHUNK || 10;

// Does the user have to be verified before being able to login?
config.userVerify = process.env.REQUIREVERIFY || false;

// Title of the site
config.title = process.env.TITLE || 'roleHaven';

/**
 * Default mode for command input.
 * Valid options are: cmd  chat
 */
config.defaultMode = process.env.DEFAULTMODE || dbDefaults.modes.command;

//
/**
 * Default language for clients connecting.
 * Default language is English.
 * Don't set this var if you want English to be the default langauge.
 * Valid options:
 */
config.defaultLanguage = process.env.DEFAULTLANGUAGE || '';

module.exports = config;
