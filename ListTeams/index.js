const azure = require('azure-storage');
const storage = require('../Shared/async_storage');

const tables = require('../Shared/constants').tableNames;

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

        const queryResult = await storage.queryEntities(tableSvc, tables.teams, query);
        const rawTeams = queryResult.entries;

        status = 200;            
        
        let teams = [];
        rawTeams.forEach((team) => {
            teams.push(Object.keys(team).reduce((acc, k) => {
                acc[k] = team[k]['_'];

                if (k == 'answeredQuestions') {
                    acc[k] = JSON.parse(acc[k]);
                }
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