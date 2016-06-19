'use strict';

const dbConnector = require('../../dbConnectors/databaseConnector');
const messenger = require('../../socketHelpers/messenger');

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

      if (params.password === gameUser.password) {
        socket.emit('loginGameUser', { loginSuccessful: true });
      } else {
        socket.emit('loginGameUser', { loginSuccessful: false });
      }
    });
  });
}

exports.handle = handle;
