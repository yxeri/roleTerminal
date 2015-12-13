'use strict';

const dbConnector = require('../../databaseConnector');
const manager = require('../../manager');
const dbDefaults = require('../../config/dbPopDefaults');
const logger = require('../../logger');
const messenger = require('../../messenger');

function handle(socket) {
  socket.on('entities', function() {
    manager.userAllowedCommand(socket.id, dbDefaults.commands.uploadkey.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      dbConnector.getAllEntities(function(err, entities) {
        if (err || entities === null) {
          logger.sendErrorMsg(logger.ErrorCodes.general, 'Could not retrieve entities', err);

          return;
        }

        const entityArray = ['Available entities:'];

        for (let i = 0; i < entities.length; i++) {
          const keyAmount = entities[i].keys.length;

          entityArray.push(entities[i].entityName + ' [' + keyAmount + ' unlocked]');
        }

        messenger.sendSelfMsg({
          socket: socket,
          message: {
            text: [entityArray],
          },
        });
      });
    });
  });

  socket.on('verifyKey', function(data) {
    manager.userAllowedCommand(socket.id, dbDefaults.commands.uploadkey.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      const keyLower = data.encryptionKey.toLowerCase();

      dbConnector.getEncryptionKey(keyLower, function(err, key) {
        if (err || key === null) {
          logger.sendErrorMsg(logger.ErrorCodes.general, 'Failed to get key. Aborting', err);
          socket.emit('commandFail');

          return;
        }

        socket.emit('commandSuccess', {
          keyData: {
            encryptionKey: key,
          },
        });
      });
    });
  });

  socket.on('unlockEntity', function(data) {
    manager.userAllowedCommand(socket.id, dbDefaults.commands.uploadkey.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      const encryptionKey = data.keyData.encryptionKey.toLowerCase();
      const entityName = data.entity.entityName.toLowerCase();
      const userName = data.user.userName;

      dbConnector.unlockEntity(encryptionKey, entityName, userName, function(err, entity) {
        if (err || entity === null) {
          logger.sendErrorMsg(logger.ErrorCodes.general, 'Failed to unlock entity. Aborting', err);
          socket.emit('commandFail');

          return;
        }

        const message = {
          text: [
            'Entity event',
            'User ' + userName + ' has used a key on entity ' + entityName,
            'Organica Re-Education Squads have been deployed',
            // TODO Send morse emit instead of object in message
          ], /*  morse: { local: true }, */
        };

        socket.emit('commandSuccess', { entity: entity });
        messenger.sendImportantMsg({
          socket: socket,
          message: message,
        });
      });
    });
  });

  socket.on('addKeys', function(data) {
    manager.userAllowedCommand(socket.id, dbDefaults.commands.addencryptionkeys.commandName,
      function(allowErr, allowed) {
        if (allowErr || !allowed) {
          return;
        }

        const keys = data.keys;

        for (let i = 0; i < keys.length; i++) {
          keys[i].key = keys[i].key.toLowerCase();
        }

        dbConnector.addEncryptionKeys(keys, function(err) {
          if (err) {
            logger.sendErrorMsg(logger.ErrorCodes.general, 'Failed to upload keys to the database', err);

            return;
          }

          messenger.sendSelfMsg({
            socket: socket,
            message: {
              text: ['Key has been uploaded to the database'],
            },
          });
        });
      });
  });

  socket.on('addEntities', function(data) {
    manager.userAllowedCommand(socket.id, dbDefaults.commands.addentities.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      const entities = data.entities;

      for (let i = 0; i < entities.length; i++) {
        entities[i].entityName = entities[i].entityName.toLowerCase();
      }

      dbConnector.addEntities(entities, function(err) {
        if (err) {
          logger.sendErrorMsg(logger.ErrorCodes.general, 'Failed to upload entities to the database', err);

          return;
        }

        messenger.sendSelfMsg({
          socket: socket,
          message: {
            text: ['Entity has been uploaded to the database'],
          },
        });
      });
    });
  });
}

exports.handle = handle;
