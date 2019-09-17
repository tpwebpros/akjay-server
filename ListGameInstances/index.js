const azure = require('azure-storage');
const storage = require('../Shared/async_storage');
const tables = require('../Shared/constants').tableNames;

module.exports = async function (context, req) {
    context.log('In `ListGameInstances`');
    const tableSvc = azure.createTableService();    

    let result = {
        message: 'Error'
    }

    let status = 500;    
    
    try {        
        const gameId = (req.query.gameId) ? req.query.gameId : null;

        let query = new azure.TableQuery()
        if (gameId) query.where('gameId eq ?', gameId);

        const queryResult = await storage.queryEntities(tableSvc, tables.gameInstances, query);
        const rawGameInstances = queryResult.entries;

        status = 200;            
        
        let instances = [];        
        for (let instance of rawGameInstances) {            
            let gameData = {};
            ({name: {_: gameData.name}, maxScore: {_: gameData.maxScore}} = await storage.retrieveEntity(tableSvc, tables.games, tables.games, instance.gameId._));
            let teams = await storage.queryEntities(tableSvc, tables.teams, new azure.TableQuery().where('instanceId eq ?', instance.RowKey._));
            
            gameData.teamCount = teams.entries.length;
            
            instances.push(Object.assign(gameData, Object.keys(instance).reduce((acc, k) => {
                acc[k] = instance[k]['_'];
                return acc;
            }, {})));
        }

        result.message = `Game instances(s) retrieved`;
        result.count = instances.length;    
        result.data = instances;
    } catch (e) {
        result.message = e.message;
    }

    context.res = {
        status,
        body: result
    }
};