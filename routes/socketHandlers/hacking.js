'use strict';

const dbConnector = require('../../db/databaseConnector');
const dbStation = require('../../db/connectors/station');
const messenger = require('../../socketHelpers/messenger');
const objectValidator = require('../../utils/objectValidator');
const manager = require('../../socketHelpers/manager');
const databasePopulation = require('../../config/defaults/config').databasePopulation;
const http = require('http');

const signalThreshold = 50;
const signalDefault = 100;
const changePercentage = 0.2;
const signalMaxChange = 10;

/**
 * @private
 * @param {string[]} - Array to be shuffled
 * @returns {string[]} - Shuffled array
 */
function shuffleArray(array) {
  const shuffledArray = array;
  let currentIndex = array.length;
  let tempVal;
  let randIndex;

  while (currentIndex !== 0) {
    randIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    tempVal = array[currentIndex];
    shuffledArray[currentIndex] = array[randIndex];
    shuffledArray[randIndex] = tempVal;
  }

  return shuffledArray;
}

function retrieveStationStats(callback) {
  require('request').get('http://wrecking.bbreloaded.se/public.json', (err, response, body) => {
    if (err) {
      console.log('Error request', response, err);

      return;
    }

    if (body) {
      const stats = JSON.parse(body);
      const stations = stats.stations;
      const teams = stats.teams;

      callback(stations, teams);
    }
  });
}

function postRequest(params) {
  const host = params.host;
  const path = params.path;
  const callback = params.callback;
  const dataString = JSON.stringify(params.data);
  const options = {
    host,
    path,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': dataString.length,
    },
    method: 'POST',
  };

  const request = http.request(options, (response) => {
    let responseString = '';

    response.setEncoding('utf-8');

    response.on('data', (data) => {
      responseString += data;
    });

    response.on('end', () => {
      callback(response.statusCode);
    });
  });

  request.write(dataString);
  request.end();
}

function updateSignalValue(stationId, boostingSignal) {
  dbStation.getStation(stationId, (err, station) => {
    if (err) {
      return;
    }

    function setNewValue(newSignalValue) {
      let ceilSignalValue = Math.ceil(newSignalValue);
      const minValue = signalDefault - signalThreshold;
      const maxValue = signalDefault + signalThreshold;

      if (ceilSignalValue > maxValue) {
        ceilSignalValue = maxValue;
      } else if (ceilSignalValue < minValue) {
        ceilSignalValue = minValue;
      }

      dbStation.updateSignalValue(stationId, ceilSignalValue, (updateErr) => {
        if (updateErr) {
          return;
        }
        postRequest({
          host: 'wrecking.bbreloaded.se',
          path: '/reports/set_boost',
          data: {
            station: stationId,
            boost: ceilSignalValue,
            key: 'hemligt',
          },
          callback: (response) => {
            console.log(response);
          },
        });
      });
    }
    const signalValue = station.signalValue;
    const difference = Math.abs(signalValue - signalDefault);
    let signalChange = (signalThreshold - difference) * changePercentage;

    if (boostingSignal && signalValue < signalDefault) {
      signalChange = signalMaxChange;
    } else if (!boostingSignal && signalValue > signalDefault) {
      signalChange = -Math.abs(signalMaxChange);
    }

    setNewValue(signalValue + signalChange);
  });
}

function handle(socket) {
  socket.on('createGameUser', (params) => {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.creategameuser.commandName, (allowErr, allowed) => {
      if (allowErr || !allowed) {
        return;
      }
    });

    if (!objectValidator.isValidData(params, { userName: true, password: true })) {
      return;
    }

    const gameUser = {
      userName: params.userName,
      password: params.password,
    };

    dbConnector.createGameUser(gameUser, (err) => {
      if (err) {
        return;
      }
    });
  });

  socket.on('getAllGameUsers', () => {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.creategameuser.commandName, (allowErr, allowed) => {
      if (allowErr || !allowed) {
        return;
      }
    });

    dbConnector.getAllGameUsers((err, gameUsers) => {
      if (err) {
        return;
      }

      messenger.sendSelfMsg({
        socket,
        message: {
          text: gameUsers.map((gameUser) => `Name: ${gameUser.userName}. Pass: ${gameUser.password}`),
        },
      });
    });
  });

  socket.on('getAllGamePasswords', () => {
    manager.userAllowedCommand(socket.id, databasePopulation.commands.creategameuser.commandName, (allowErr, allowed) => {
      if (allowErr || !allowed) {
        return;
      }
    });

    dbConnector.getAllGamePasswords((passErr, gamePasswords) => {
      if (passErr) {
        return;
      }

      messenger.sendSelfMsg({
        socket,
        message: {
          text: gamePasswords.map(gamePassword => `${gamePassword.password}`),
        },
      });
    });
  });

  socket.on('getStationStats', () => {
    socket.join('stationStats');

    retrieveStationStats((stations, teams) => {
      dbStation.getActiveStations((err, dbStations) => {
        if (err) {
          return;
        }

        if (stations) {
          for (const station of stations) {
            const foundStation = dbStations.find(dbs => dbs.stationId === station.id);

            if (foundStation) {
              station.signalValue = foundStation.signalValue;
            } else {
              station.signalValue = station.boost;
            }
          }

          socket.emit('stationStats', { stations, teams });
        } else {
          socket.emit('stationStats', { dbStations, teams });
        }
      });
    });
  });

  socket.on('manipulateStation', (params) => {
    if (!objectValidator.isValidData(params, { users: true, gameUser: true, choice: true, stationId: true })) {
      return;
    }

    const sentUser = params.gameUser;

    if (params.users.map((user) => user.userName).indexOf(sentUser.userName) === -1) {
      messenger.sendSelfMsg({
        socket,
        message: {
          text: ['User is not authorized to access the LANTERN'],
        },
      });
      socket.emit('commandStep', { reset: true });

      return;
    }

    dbConnector.getGameUser(sentUser.userName.toLowerCase(), (err, gameUser) => {
      if (err) {
        socket.emit('commandFail');

        return;
      } else if (gameUser === null) {
        messenger.sendSelfMsg({
          socket,
          message: {
            text: [`User ${sentUser.userName} does not exist`],
          },
        });
        socket.emit('commandStep', { reset: true });

        return;
      }

      if (params.gameUser.password === gameUser.password) {
        const choice = params.choice;

        switch (choice) {
          case '1': {
            messenger.sendSelfMsg({
              socket,
              message: {
                text: [
                  'You have been authorized to access the LANTERN',
                  'LSM is fully functional and running',
                  'Amplifying signal output',
                ],
              },
            });
            socket.emit('commandSuccess', { noStepCall: true });
            updateSignalValue(params.stationId, true);

            break;
          }
          case '2': {
            messenger.sendSelfMsg({
              socket,
              message: {
                text: [
                  'You have been authorized to access the LANTERN',
                  'LSM is fully functional and running',
                  'Dampening signal output',
                ],
              },
            });
            socket.emit('commandSuccess', { noStepCall: true });
            updateSignalValue(params.stationId, false);

            break;
          }
          default: {
            messenger.sendSelfMsg({
              socket,
              message: {
                text: ['Incorrect choice'],
              },
            });
            socket.emit('commandStep', { reset: true });

            break;
          }
        }
      } else {
        messenger.sendSelfMsg({
          socket,
          message: {
            text: ['Incorrect password'],
          },
        });
        socket.emit('commandStep', { reset: true });
      }
    });
  });

  socket.on('getGameUsersSelection', (params) => {
    if (!objectValidator.isValidData(params, { userAmount: true })) {
      return;
    }

    dbConnector.getAllGameUsers((err, gameUsers) => {
      if (err || gameUsers === null) {
        socket.emit('commandFail');

        return;
      }

      dbConnector.getAllGamePasswords((passErr, gamePasswords) => {
        if (passErr || gamePasswords === null) {
          socket.emit('commandFail');

          return;
        }

        const userAmount = params.userAmount;
        const users = shuffleArray(gameUsers).slice(0, userAmount);
        const correctPassword = users[Math.floor(Math.random() * userAmount)].password;
        const shuffledPasswords = shuffleArray(gamePasswords.map((password) => password.password));
        const passwords = [
          shuffleArray(shuffledPasswords.slice(0, 5).concat([correctPassword])),
          shuffleArray(shuffledPasswords.slice(5, 11).concat([correctPassword])),
        ];

        socket.emit('commandSuccess', {
          freezeStep: true,
          newData: {
            users,
            passwords,
          },
        });
      });
    });
  });

  socket.on('getActiveStations', () => {
    dbStation.getActiveStations((err, stations) => {
      if (err) {
        return;
      }

      if (stations && stations.length > 0) {
        socket.emit('commandSuccess', { newData: { stations } });
      } else {
        messenger.sendSelfMsg({ message: { text: ['There are no active LANTERNs available'] } });
        socket.emit('commandFail');
      }
    });
  });
}

exports.handle = handle;
