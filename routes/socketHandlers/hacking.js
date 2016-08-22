'use strict';

const dbConnector = require('../../db/databaseConnector');
const dbStation = require('../../db/connectors/station');
const messenger = require('../../socketHelpers/messenger');
const objectValidator = require('../../utils/objectValidator');

const maxSignal = 100;
const signalPercentage = 0.1;

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

function updateSignalValue(stationId, boostingSignal) {
  dbStation.getStation(stationId, (err, station) => {
    if (err) {
      return;
    }

    const signalValue = station.signalValue;

    function setNewValue(newSignalValue) {
      dbStation.updateSignalValue(stationId, Math.ceil(newSignalValue), (updateErr) => {
        if (updateErr) {
          return;
        }
      });
    }

    const modifiedMaxSignal = boostingSignal ? maxSignal : -maxSignal;

    if ((boostingSignal && signalValue > 0) || (!boostingSignal && signalValue < 0)) {
      setNewValue(signalValue + ((modifiedMaxSignal - signalValue) * signalPercentage));
    } else {
      setNewValue(signalValue + (modifiedMaxSignal * signalPercentage));
    }
  });
}

function handle(socket) {
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
