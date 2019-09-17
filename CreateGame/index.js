const azure = require('azure-storage');
const uuidv1 = require('uuid/v1');
const stripJs = require('strip-js');
const storage = require('../Shared/async_storage');
const tables = require('../Shared/constants').tableNames;

module.exports = async function (context, req) {
    context.log('In `CreateGame`');

    const tableSvc = azure.createTableService();
    const body = req.body;

    let result = {
        message: 'Error'
    }

    let status = 500;
    
    if (body.hasOwnProperty('name') &&
        body.hasOwnProperty('maxScore'))
    {  
        const gameName = stripJs(body.name);
        const maxScore = parseInt(body.maxScore);
        
        try {
            await storage.createTable(tableSvc, tables.games);            

            let existingGames = await storage.queryEntities(tableSvc, tables.games, new azure.TableQuery().where('name eq ?', gameName));
            if (existingGames.entries.length) {
                throw Error('Game name already registered');
            }

            let uuid = uuidv1();
            await storage.insertEntity(tableSvc, tables.games, {
                PartitionKey: 'games',
                RowKey: uuid,
                name: gameName,
                maxScore
            });

            status = 200;
            result = {
                message: 'Game inserted',
                newId: uuid
            }
        } catch (e) {            
            result.message = e.message;
        }        
    } else {
        result.message = 'The `gameName` and `maxScore` fields are all required.';
    }

    context.res = {
        status,
        body: result
    };
};