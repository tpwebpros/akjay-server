const azure = require('azure-storage');
const storage = require('../Shared/async_storage');
const tables = require('../Shared/constants').tableNames;

module.exports = async function (context, req) {
    context.log('In `ListGames`');
    const tableSvc = azure.createTableService();    

    let result = {
        message: 'Error'
    }

    let status = 500;
    
    try {
        const queryResult = await storage.queryEntities(tableSvc, tables.games, new azure.TableQuery());
        const rawGames = queryResult.entries;

        status = 200;            
        
        let games = [];
        rawGames.forEach((game) => {
            games.push(Object.keys(game).reduce((acc, k) => {
                acc[k] = game[k]['_'];

                if (k == 'questions') {
                    acc[k] = JSON.parse(acc[k]);
                }

                return acc;
            }, {}));
        });

        result.message = `Games(s) retrieved`;
        result.count = games.length;
        result.data = games;
    } catch (e) {
        result.message = e.message;
    }

    context.res = {
        status,
        body: result
    }
};