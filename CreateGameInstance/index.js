const azure = require('azure-storage');
const uuidv1 = require('uuid/v1');
const stripJs = require('strip-js');
const storage = require('../Shared/async_storage');

const questionTableName = 'questions';
const gameTableName = 'games';
const gameInstanceTableName = 'gameinstances';
const teamTableName = 'teams';

module.exports = async function (context, req) {
    context.log('In `CreateGameInstance`');

    const tableSvc = azure.createTableService();
    const body = req.body;

    let result = {
        message: 'Error'
    }

    let status = 500;
    
    if (req.body.hasOwnProperty('gameId'))
    {  
        const gameId = req.body.gameId;
                
        try {
            await storage.createTable(tableSvc, gameInstanceTableName);
            await storage.createTable(tableSvc, teamTableName);

            let existingGame = await storage.retrieveEntity(tableSvc, gameTableName, 'games', gameId);

            let uuid = uuidv1();
            await storage.insertEntity(tableSvc, gameInstanceTableName, {
                PartitionKey: 'gameinstances',
                RowKey: uuid,
                gameId
            });

            status = 200;
            result = {
                message: 'Game instance created',
                newId: uuid
            }
        } catch (e) {            
            result.message = e.message;
        }        
    } else {
        result.message = 'The `gameId` parameter is required.';
    }

    context.res = {
        status,
        body: result
    };
};