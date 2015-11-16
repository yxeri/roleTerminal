'use strict';

const dbConnector = require('../../databaseConnector');
const manager = require('../../manager');
const dbDefaults = require('../../config/dbPopDefaults');
const logger = require('../../logger');

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

        socket.emit('messages', [{ text : entityArray }]);

      });
    });
  });

  socket.on('verifyKey', function(sentKey) {
    manager.userAllowedCommand(socket.id, dbDefaults.commands.uploadkey.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      const keyLower = sentKey.toLowerCase();

      dbConnector.getEncryptionKey(keyLower, function(err, key) {
        if (err || key === null) {
          logger.sendErrorMsg(logger.ErrorCodes.general, 'Failed to get key. Aborting', err);
          socket.emit('commandFail');
          return;
        }

        const data = {};

        data.keyData = key;
        socket.emit('commandSuccess', data);

      });
    });
  });

  socket.on('unlockEntity', function(data) {
    manager.userAllowedCommand(socket.id, dbDefaults.commands.uploadkey.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      data.entityName = data.entityName.toLowerCase();
      data.keyData.key = data.keyData.key.toLowerCase();

      dbConnector.unlockEntity(data.keyData.key, data.entityName, data.userName, function(err, entity) {
        if (err || entity === null) {
          logger.sendErrorMsg(logger.ErrorCodes.general, 'Failed to unlock entity. Aborting', err);
          socket.emit('commandFail');
          return;
        }

        const message = {
          text : [
            'Entity event',
            'User ' + data.userName + ' has used a key on entity ' + data.entityName,
            'Organica Re-Education Squads have been deployed'
          ], morse : { local : true }
        };

        socket.emit('commandSuccess', entity);
        socket.broadcast.emit('importantMsg', message);
        socket.emit('importantMsg', message);

      });
    });
  });

  socket.on('addKeys', function(keys) {
    manager.userAllowedCommand(socket.id, dbDefaults.commands.addencryptionkeys.commandName,
      function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      for (let i = 0; i < keys.length; i++) {
        keys[i].key = keys[i].key.toLowerCase();
      }

      dbConnector.addEncryptionKeys(keys, function(err) {
        if (err) {
          logger.sendErrorMsg(logger.ErrorCodes.general, 'Failed to upload keys to the database', err);
          return;
        }

        socket.emit('messages', [{
          text : ['Key has been uploaded to the database']
        }]);
      });
    });
  });

  socket.on('addEntities', function(entities) {
    manager.userAllowedCommand(socket.id, dbDefaults.commands.addentities.commandName, function(allowErr, allowed) {
      if (allowErr || !allowed) {
        return;
      }

      for (let i = 0; i < entities.length; i++) {
        entities[i].entityName = entities[i].entityName.toLowerCase();
      }

      dbConnector.addEntities(entities, function(err) {
        if (err) {
          logger.sendErrorMsg(logger.ErrorCodes.general, 'Failed to upload entities to the database', err);
          return;
        }

        socket.emit('messages', [{
          text : ['Entity has been uploaded to the database']
        }]);
      });
    });
  });
}

exports.handle = handle;
