'use strict';

const express = require('express');
const router = new express.Router();
const chat = require('./socketHandlers/chat');
const userManagement = require('./socketHandlers/userManagement');
const dbConnector = require('../databaseConnector');
const commandManagement = require('./socketHandlers/commandManagement');
const team = require('./socketHandlers/team');
const hacking = require('./socketHandlers/hacking');
const manager = require('../manager');
const appConfig = require('../config/appConfig');
const serverConfig = require('../config/serverConfig');
const http = require('http');
const dbDefaults = require('../config/dbPopDefaults');
const logger = require('../logger');
const messenger = require('../messenger');
const deviceManagement = require('./socketHandlers/deviceManagement');

// Blodsband specific
const blodsband = require('./socketHandlers/blodsband');

function generateWeatherReport(jsonObj) {
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

function createUserPosition(user) {
  const position = user.position;
  const timestamp = new Date(position.timestamp);
  const locObj = {};
  const coords = {};

  coords.latitude = position.latitude;
  coords.longitude = position.longitude;
  coords.heading = position.heading;
  locObj.coords = coords;
  locObj.timestamp = timestamp;
  locObj.accuracy = position.accuracy;

  return locObj;
}

function handle(io) {
  router.get('/', function(req, res) {
    res.render('index', {
      title: appConfig.title,
      socketPath: serverConfig.socketPath,
    });
  });

  io.on('connection', function(socket) {
    userManagement.handle(socket, io);
    chat.handle(socket, io);
    commandManagement.handle(socket, io);
    deviceManagement.handle(socket, io);
    team.handle(socket, io);
    hacking.handle(socket, io);
    blodsband.handle(socket, io);

    socket.on('disconnect', function() {
      dbConnector.getUserById(socket.id, function(err, user) {
        if (err || user === null) {
          console.log('User has disconnected. Couldn\'t retrieve user name');
        } else {
          dbConnector.updateUserSocketId(user.userName, '', function(userErr, socketUser) {
            if (userErr || socketUser === null) {
              console.log('Failed to reset user socket ID', userErr);

              return;
            }

            dbConnector.setUserLastOnline(user.userName, new Date(), function(userOnlineErr, settedUser) {
              if (userOnlineErr || settedUser === null) {
                console.log('Failed to set last online');

                return;
              }

              dbConnector.updateUserOnline(settedUser.userName, false, function(onlineErr, updatedUser) {
                if (onlineErr || updatedUser === null) {
                  console.log('Failed to update online', onlineErr);
                }
              });
            });
          });

          console.log(socket.id, user.userName, 'has disconnected');
        }
      });
    });

    // TODO This should be moved
    socket.on('locate', function(data) {
      manager.userAllowedCommand(socket.id, dbDefaults.commands.locate.commandName, function(allowErr, allowed, user) {
        if (allowErr || !allowed) {
          return;
        }

        const locationData = {};

        // Return all user locations
        if (data.user.userName === '*') {
          dbConnector.getAllUserLocations(data.user, function(err, users) {
            if (err || users === null) {
              logger.sendSocketErrorMsg(socket, logger.ErrorCodes.db, 'Failed to get user location', err);

              return;
            }

            for (let i = 0; i < users.length; i++) {
              const currentUser = users[i];
              const userName = currentUser.userName;

              if (users[i].position !== undefined) {
                locationData[userName] = createUserPosition(currentUser);
              }
            }

            socket.emit('locationMsg', locationData);
          });
        } else {
          dbConnector.getUserLocation(user, data.user.userName, function(err, foundUser) {
            if (err || foundUser === null) {
              logger.sendSocketErrorMsg(socket, logger.ErrorCodes.db, 'Failed to get user location', err);
            } else if (foundUser.position !== undefined) {
              const userName = foundUser.userName;
              locationData[userName] = createUserPosition(foundUser);

              socket.emit('locationMsg', locationData);
            } else {
              logger.sendSocketErrorMsg(socket, logger.ErrorCodes.notFound, 'Unable to locate ' + data.user.userName);
            }
          });
        }
      });
    });

    // TODO This should be moved
    socket.on('time', function() {
      manager.userAllowedCommand(socket.id, dbDefaults.commands.time.commandName, function(allowErr, allowed) {
        if (allowErr || !allowed) {
          return;
        }

        socket.emit('time', { time: new Date() });
      });
    });

    socket.on('weather', function() {
      manager.userAllowedCommand(socket.id, dbDefaults.commands.weather.commandName, function(allowErr, allowed) {
        if (allowErr || !allowed) {
          return;
        }

        const lat = appConfig.gameLocation.lat;
        const lon = appConfig.gameLocation.lon;
        const hoursAllowed = [0, 4, 8, 12, 16, 20];
        let url = '';

        if (appConfig.gameLocation.country.toLowerCase() === 'sweden') {
          url = 'http://opendata-download-metfcst.smhi.se/api/category/pmp1.5g/version/1/geopoint/lat/' + lat + '/lon/' + lon + '/data.json';
        }

        http.get(url, function(resp) {
          let body = '';

          resp.on('data', function(chunk) {
            body += chunk;
          });

          resp.on('end', function() {
            const response = JSON.parse(body);
            const times = response.timeseries;
            const now = new Date();
            const report = [];

            for (let i = 0; i < times.length; i++) {
              const weatherRep = generateWeatherReport(times[i]);

              if (weatherRep.time > now && hoursAllowed.indexOf(weatherRep.time.getHours()) > -1) {
                report.push(weatherRep);
              } else if (weatherRep.time < now && times[i + 1] && new Date(times[i + 1].validTime) > now) {
                if (now.getMinutes() > 30) {
                  report.push(generateWeatherReport(times[i + 1]));
                } else {
                  report.push(weatherRep);
                }
              }
            }

            socket.emit('weather', report);
          });
        }).on('error', function(err) {
          console.log('Failed to get weather status', err);
        });
      });
    });

    // TODO This should be moved
    /*
     * Updates socket ID on the device in the database and joins the socket
     * to the device room
     */
    socket.on('updateDeviceSocketId', function(data) {
      const deviceId = data.device.deviceId;
      const socketId = data.user.socketId;
      const userName = data.user.userName;

      socket.join(deviceId + dbDefaults.device);

      dbConnector.updateDeviceSocketId(deviceId, socketId, userName, function(err, device) {
        if (err || device === null) {
          return;
        }

        messenger.sendSelfMsg({
          socket: socket,
          message: {
            text: ['Device has been updated'],
          },
        });
      });
    });

    socket.on('getStoredMessages', function() {
      socket.emit('storedMessages', { storedMessages: require('../config/messages') });
    });
  });

  return router;
}

module.exports = handle;
