const azure = require('azure-storage');
const uuidv1 = require('uuid/v1');
const storage = require('../Shared/async_storage');

// const sortEntriesByNumber = require('../Shared/util').sortEntriesByNumber;

const tableName = 'teams';

module.exports = async function (context, req) {
    context.log('In `ListTeams`');
    const tableSvc = azure.createTableService();    

    let result = {
        message: 'Error'
    }

    let status = 500;
    
    
    try {
        const instanceId = (req.query.instanceId) ? req.query.instanceId : null;

        let query = new azure.TableQuery()
        if (instanceId) query.where('instanceId eq ?', instanceId);

        const queryResult = await storage.queryEntities(tableSvc, tableName, query);
        const rawTeams = queryResult.entries;

        status = 200;            
        
        let teams = [];
        rawTeams.forEach((team) => {
            teams.push(Object.keys(team).reduce((acc, k) => {
                acc[k] = team[k]['_'];
                return acc;
            }, {}));
        });

        result.message = `Teams(s) retrieved`;
        result.count = teams.length;
        result.data = teams;
    } catch (e) {
        result.message = e.message;
    }

    context.res = {
        status,
        body: result
    }
};