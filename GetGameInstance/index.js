const azure = require('azure-storage');
const storage = require('../Shared/async_storage');
const tables = require('../Shared/constants').tableNames;
const util = require('../Shared/util');
const axios = require('axios');
const URL = require('url').URL;

module.exports = async function (context, req) {
    context.log('In `GetGameInstance`');

    const tableSvc = azure.createTableService();  
    const requestUrl = new URL(req.url); 

    let result = {
        message: 'Error'
    }

    let status = 500;
    
    if (req.params.instanceId) {
        const instanceId = req.params.instanceId;

        try {
            const instance = await storage.retrieveEntity(tableSvc, tables.gameInstances, tables.gameInstances, instanceId);
            const teams = await axios.get(`${requestUrl.origin}/api/teams`, {
                params: { instanceId, code: req.query.code }
            });

            status = 200;            
            result.data = util.retrieveValues(instance);
            result.teams = teams.data.data;

            result.message = 'Game instance retrieved';
        } catch (e) {
            result.message = e.message;
        }
    }  

    context.res = {
        status,
        body: result
    }
};