'use strict';

const manager = require('../../socketHelpers/manager');
const databasePopulation = require('../../config/defaults/config').databasePopulation;
const appConfig = require('../../config/defaults/config').app;
const logger = require('../../utils/logger');
const http = require('http');

/**
 * Prepare a weather report from the retrieved json object
 * @param jsonObj JSON object retrieved from external source
 * @returns {} Returns weather report
 */
function createWeatherReport(jsonObj) {
  const weatherRep = {};

  weatherRep.time = new Date(jsonObj.validTime);
  weatherRep.temperature = jsonObj.t;
  weatherRep.visibility = jsonObj.vis;
  weatherRep.windDirection = jsonObj.wd;
  weatherRep.thunder = jsonObj.tstm;
  weatherRep.gust = jsonObj.gust;
  weatherRep.cloud = jsonObj.tcc;
  weatherRep.precipitation = jsonObj.pit;
  weatherRep.precipType = jsonObj.pcat;

  return weatherRep;
}

function handle(socket) {
  /**
   * Time command. Returns current date
   * Emits time
   */
  socket.on('time', () => {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.time.commandName, (allowErr, allowed) => {
      if (allowErr || !allowed) {
        return;
      }

      const now = new Date();

      now.setFullYear(now.getFullYear() + appConfig.yearModification);
      socket.emit('time', { time: now });
    });
  });

  /**
   * Weather command. Returns weather for coming days. Weather is retrieved from external source
   * Emits weather
   */
   // TODO Should average values across hours
  socket.on('weather', () => {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.weather.commandName, (allowErr, allowed) => {
      if (allowErr || !allowed) {
        return;
      }

      const lat = appConfig.centerLat.toFixed(2);
      const lon = appConfig.centerLong.toFixed(2);
      const hoursAllowed = [0, 4, 8, 12, 16, 20];
      let url = '';

      if (appConfig.country.toLowerCase() === 'sweden') {
        url = `http://opendata-download-metfcst.smhi.se/api/category/pmp1.5g/version/1/geopoint/lat/${lat}/lon/${lon}/data.json`;
      }

      http.get(url, (resp) => {
        let body = '';

        resp.on('data', (chunk) => {
          body += chunk;
        });

        resp.on('end', () => {
          const response = JSON.parse(body);
          const times = response.timeseries;
          const now = new Date();
          const report = [];

          for (let i = 0; i < times.length; i++) {
            const weatherRep = createWeatherReport(times[i]);

            if (weatherRep.time > now && hoursAllowed.indexOf(weatherRep.time.getHours()) > -1) {
              report.push(weatherRep);
            } else if (weatherRep.time < now && times[i + 1] && new Date(times[i + 1].validTime) > now) {
              if (now.getMinutes() > 30) {
                report.push(createWeatherReport(times[i + 1]));
              } else {
                report.push(weatherRep);
              }
            }
          }

          socket.emit('weather', report.splice(0, appConfig.maxWeatherReports));
        });
      }).on('error', (err) => {
        logger.sendErrorMsg({
          code: logger.ErrorCodes.general,
          text: ['Failed to get weather status'],
          err,
        });
      });
    });
  });
}

exports.handle = handle;
