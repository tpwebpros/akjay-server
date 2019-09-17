const azure = require('azure-storage');
const uuidv1 = require('uuid/v1');
const stripJs = require('strip-js');
const storage = require('../Shared/async_storage');
const tables = require('../Shared/constants').tableNames;

module.exports = async function (context, req) {
    context.log('in `DeleteTeam`');
    const tableSvc = azure.createTableService();

    let result = {
        message: 'Error'
    }

    let status = 500;

    if (req.params.id) {
        try {
            let team = await storage.retrieveEntity(tableSvc, tables.teams, tables.teams, req.params.id);
            await storage.deleteEntity(tableSvc, 'teams', team);
            
            result.message = 'Team deleted';
            status = 200;
        } catch (e) {
            result.message = e.message;
        }        
    }  

    context.res = {
        status,
        body: result
    }
};