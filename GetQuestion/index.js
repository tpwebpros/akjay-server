const azure = require('azure-storage');
const uuidv1 = require('uuid/v1');
const stripJs = require('strip-js');
const storage = require('../Shared/async_storage');

const tableName = 'questions';

module.exports = async function (context, req) {
    context.log('In `GetQuestion`');

    const tableSvc = azure.createTableService();    

    let result = {
        message: 'Error'
    }

    let status = 500;
    
    if (req.params.questionId) {
        const questionId = req.params.questionId;

        try {
            const question = await storage.retrieveEntity(tableSvc, tableName, 'questions', questionId);

            status = 200;            
            result.data = Object.keys(question).reduce((acc, k) => {
                acc[k] = question[k]['_'];
                return acc;
            }, {});

            result.message = 'Question retrieved';
        } catch (e) {
            result.message = e.message;
        }
    }  

    context.res = {
        status,
        body: result
    }
};