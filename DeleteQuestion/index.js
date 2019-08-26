const azure = require('azure-storage');
const uuidv1 = require('uuid/v1');
const stripJs = require('strip-js');
const storage = require('../Shared/async_storage');

const tableName = 'questions';

module.exports = async function (context, req) {
    context.log('In `DeleteQuestion`');
    const tableSvc = azure.createTableService();    

    let result = {
        message: 'Error'
    }

    let status = 500;
    
    if (req.params.id) {
        const questionId = req.params.id;

        try {
            let question = await storage.retrieveEntity(tableSvc, tableName, 'questions', questionId);
            await storage.deleteEntity(tableSvc, tableName, question);
            
            result.message = 'Question deleted';
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