'use strict';

const dbConnector = require('../../dbConnectors/databaseConnector');
const messenger = require('../../socketHelpers/messenger');

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

function handle(socket) {
  socket.on('loginGameUser', (params) => {
    dbConnector.getGameUser(params.userName.toLowerCase(), (err, gameUser) => {
      if (err) {
        return;
      } else if (gameUser === null) {
        messenger.sendSelfMsg({
          socket,
          message: {
            text: [`User ${params.userName} does not exist`],
          },
        });

        return;
      }

      let loginSuccessful = false;

      if (params.password === gameUser.password) {
        loginSuccessful = true;
      }

      socket.emit('loginGameUser', { loginSuccessful });
    });
  });

  socket.on('getGameUsersSelection', (params) => {
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

        // TODO Get random passwords that do not match the chosen password

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
}

exports.handle = handle;
