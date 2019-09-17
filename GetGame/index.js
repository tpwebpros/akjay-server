const azure = require('azure-storage');
const storage = require('../Shared/async_storage');
const tables = require('../Shared/constants').tableNames;
const util = require('../Shared/util');
const axios = require('axios');
const URL = require('url').URL;

module.exports = async function (context, req) {
    context.log('In `GetGame`');

    const tableSvc = azure.createTableService();    
    const requestUrl = new URL(req.url);

    let result = {
        message: 'Error'
    }

    let status = 500;
    
    if (req.params.gameId) {
        const gameId = req.params.gameId;

        try {
            const game = await storage.retrieveEntity(tableSvc, tables.games, tables.games, gameId);
            const uri = `${requestUrl.origin}/api/questions`;
            
            const questions = await axios.get(uri, {
                params: { gameId, code: req.query.code }
            });
            
            status = 200;            

            let data = util.retrieveValues(game);
            data.questions = questions.data.data;
            
            result.data = data;
            result.message = 'Game retrieved';
        } catch (e) {
            result.message = e.message;
        }
    }  

    context.res = {
        status,
        body: result
    }
};