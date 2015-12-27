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
config.historyLines = process.env.MAXHISTORY || 80;
config.chunkLength = process.env.MAXCHUNK || 10;
config.userVerify = process.env.REQUIREVERIFY || false;
config.title = process.env.TITLE || 'Organica Oracle v4.0';
config.defaultMode = process.env.DEFAULTMODE || dbDefaults.modes.command;

module.exports = config;
