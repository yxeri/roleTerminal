'use strict';

const express = require('express');
const router = express.Router();
const chat = require('./socketHandlers/chat');
const userManagement = require('./socketHandlers/userManagement');
const dbConnector = require('../databaseConnector');
const commandManagement = require('./socketHandlers/commandManagement');
const hacking = require('./socketHandlers/hacking');
const manager = require('../manager');
const appConfig = require('../config/appConfig');
const http = require('http');
const dbDefaults = require('../config/dbPopDefaults');
const logger = require('../logger');
//Blodsband specific
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
  const locTime = new Date(position.timestamp);
  const locObj = {};
  const coords = {};

  coords.latitude = position.latitude;
  coords.longitude = position.longitude;
  coords.heading = position.heading;
  locObj.coords = coords;

  locObj.locTime = locTime;
  locObj.accuracy = position.accuracy;

  return locObj;
}

function handle(io) {
  router.get('/', function(req, res) {
    res.render('index', { title : 'Organica Oracle v4.0' });
  });

  io.on('connection', function(socket) {
    userManagement.handle(socket, io);
    chat.handle(socket, io);
    commandManagement.handle(socket, io);
    hacking.handle(socket, io);
    blodsband.handle(socket, io);

    socket.on('disconnect', function() {
      dbConnector.getUserById(socket.id, function(err, user) {
        if (err || user === null) {
          console.log(
            'User has disconnected. Couldn\'t retrieve user name'
          );
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

    //TODO This should be moved
    socket.on('locate', function(sentUserName) {
      manager.userAllowedCommand(socket.id, dbDefaults.commands.locate.commandName, function(allowErr, allowed, user) {
        if (allowErr || !allowed) {
          return;
        }

        const locationData = {};

        // Return all user locations
        if (sentUserName === '*') {
          dbConnector.getAllUserLocations(user, function(err, users) {
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
          //TODO Refactor this
          dbConnector.getUserLocation(user, sentUserName, function(err, foundUser) {
            if (err || foundUser === null) {
              logger.sendSocketErrorMsg(socket, logger.ErrorCodes.db, 'Failed to get user location', err);
            } else if (foundUser.position !== undefined) {
              const userName = foundUser.userName;

              locationData[userName] = createUserPosition(foundUser);

              socket.emit('locationMsg', locationData);
            } else {
              logger.sendSocketErrorMsg(socket, logger.ErrorCodes.notFound, 'Unable to locate ' + sentUserName);
            }
          });
        }
      });
    });

    //TODO This should be moved
    socket.on('time', function() {
      manager.userAllowedCommand(socket.id, dbDefaults.commands.time.commandName, function(allowErr, allowed) {
        if (allowErr || !allowed) {
          return;
        }

        socket.emit('time', new Date());
      });
    });

    socket.on('weather', function() {
      manager.userAllowedCommand(socket.id, dbDefaults.commands.weather.commandName, function(allowErr, allowed) {
        if (allowErr, !allowed) {
          return;
        }

        const lat = appConfig.gameLocation.lat;
        const lon = appConfig.gameLocation.lon;
        const hoursAllowed = [0, 4, 8, 12, 16, 20];
        let url = '';

        if (appConfig.gameLocation.country.toLowerCase() === 'sweden') {
          url = 'http://opendata-download-metfcst.smhi.se/api/category/pmp1.5g/' +
                'version/1/geopoint/lat/' + lat + '/lon/' + lon + '/data.json';
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

    //TODO This should be moved
    /*
     * Updates socket ID on the device in the database and joins the socket
     * to the device room
     */
    socket.on('updateDeviceSocketId', function(data) {
      const deviceId = data.deviceId;
      const socketId = data.socketId;
      const user = data.user;

      socket.join(deviceId + dbDefaults.device);

      dbConnector.updateDeviceSocketId(deviceId, socketId, user, function(err, device) {
        if (err || device === null) {
          console.log('Failed to update device', err);
          return;

        }

        socket.emit('message', {
          text : ['Device has been updated']
        });
      });
    });

    //TODO This should be moved
    socket.on('updateDevice', function(data) {
      manager.userAllowedCommand(socket.id, dbDefaults.commands.updatedevice.commandName, function(allowErr, allowed) {
        if (allowErr || !allowed) {
          return;
        }

        const deviceId = data.deviceId;
        const field = data.field;
        const value = data.value;
        const callback = function(err, device) {
          if (err || device === null) {
            let errMsg = 'Failed to update device';

            if (err && err.code === 11000) {
              errMsg += '. Alias already exists';
            }

            socket.emit('message', {
              text : [errMsg]
            });
            console.log(errMsg, err);
            return;
          }

          socket.emit('message', {
            text : ['Device has been updated']
          });
        };

        switch (field) {
          case 'alias':
            dbConnector.updateDeviceAlias(deviceId, value, callback);

            break;
          default:
            socket.emit('message', {
              text : ['Invalid field. Device doesn\'t have ' + field]
            });

            break;
        }
      });
    });

    socket.on('verifyDevice', function(data) {
      dbConnector.getDevice(data.device, function(err, device) {
        if (err || device === null) {
          socket.emit('message', {
            text : [
              'Device is not in the database'
            ]
          });
          socket.emit('commandFail');
          return;
        }

        socket.emit('message', {
          text : [
            'Device found in the database'
          ]
        });
        socket.emit('commandSuccess', data);
      });
    });

    //TODO Sub-command?
    socket.on('listDevices', function() {
      manager.userAllowedCommand(socket.id, dbDefaults.commands.list.commandName, function(allowErr, allowed, user) {
        if (allowErr || !allowed) {
          return;
        } else if (user.accessLevel < 11) {
          logger.sendSocketErrorMsg(socket, logger.ErrorCodes.unauth, 'You are not allowed to list devices');
          return;
        }

        dbConnector.getAllDevices(function(devErr, devices) {
          if (devErr) {
            logger.sendErrorMsg(logger.ErrorCodes.db, 'Failed to get all devices', devErr);
            return;
          }

          const allDevices = [];

          if (devices.length > 0) {
            for (let i = 0; i < devices.length; i++) {
              const device = devices[i];
              let deviceString = '';

              deviceString += 'DeviceID: ' + device.deviceId + '\t';

              if (device.alias !== device.deviceId) {
                deviceString += 'Alias: ' + device.alias + '\t';
              }

              deviceString += 'Last user: ' + device.lastUser;
              allDevices.push(deviceString);
            }

            socket.emit('message', {
              text : allDevices
            });
          }
        });
      });
    });
  });

  return router;
}

module.exports = handle;
