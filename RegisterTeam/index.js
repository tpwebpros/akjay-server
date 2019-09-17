const azure = require('azure-storage');
const uuidv1 = require('uuid/v1');
const stripJs = require('strip-js');
const storage = require('../Shared/async_storage');
const tables = require('../Shared/constants').tableNames;

module.exports = async function (context, req) {
    context.log('in `RegisterTeam`');
    const tableSvc = azure.createTableService();

    let result = {
        message: 'Error'        
    }

    let status = 500;
    
    if (req.body.hasOwnProperty('name') && req.body.hasOwnProperty('instanceId')) {
        const teamName = stripJs(req.body.name);
        const instanceId = req.body.instanceId;

        try {
            await storage.createTable(tableSvc, 'teams');

            let existingTeams = await storage.queryEntities(tableSvc, tables.teams, new azure.TableQuery().where('name eq ? and instanceId eq ?', teamName, instanceId));
            if (existingTeams.entries.length) {
                throw Error('A team of the same name is already registered in this instance.');
            }

            let uuid = uuidv1();
            await storage.insertEntity(tableSvc, tables.teams, {
                PartitionKey: tables.teams,
                RowKey: uuid,
                name: teamName,
                score: 0,
                answeredQuestions: JSON.stringify([]),
                instanceId
            });

            status = 200;
            result = {
                message: 'Team registered',                
                newId: uuid
            }    
        } catch (e) {            
            result.message = e.message;
        }        
    } else {
        result.message = 'Both a team name and instance ID are required.';
    }

    context.res = {
        status,
        body: result
    };
};  