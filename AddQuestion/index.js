const azure = require('azure-storage');
const uuidv1 = require('uuid/v1');
const stripJs = require('strip-js');
const storage = require('../Shared/async_storage');

const sortEntriesByNumber = require('../Shared/util').sortEntriesByNumber;
const tables = require('../Shared/constants').tableNames;

module.exports = async function (context, req) {
    context.log('In `AddQuestion`');

    const tableSvc = azure.createTableService();
    const body = req.body;

    let result = {
        message: 'Error'
    }

    let status = 500;
    
    if (body.hasOwnProperty('questionText') && 
        body.hasOwnProperty('answerText') &&
        body.hasOwnProperty('value'))
    {  
        const questionText = stripJs(body.questionText).trim();
        const answerText = stripJs(body.answerText).trim();
        const value = body.value;  
        let number = body.number;     

        try {
            await storage.createTable(tableSvc, tables.questions);

            // retrieve and sort existing questions by number
            let unsortedEntries = await storage.queryEntities(tableSvc, tables.questions, new azure.TableQuery());
            let sortedQuestions = sortEntriesByNumber(unsortedEntries.entries).reverse();
            let number = body.number || 1;

            if (sortedQuestions.length) {
                // if a question number was not passed, find the next largest and use that
                if (!body.number) number = (sortedQuestions[0]['number']['_']) ? sortedQuestions[0]['number']['_'] + 1 : number;
                
                // check if an existing question with the same text or number exists
                if(sortedQuestions.findIndex((q) => {
                    return (q['number']['_'] == number || q['questionText']['_'] == questionText);
                }) > -1) {                
                    throw Error('Question with identical text or number already exists.');
                }
            }

            let uuid = uuidv1();
            await storage.insertEntity(tableSvc, tables.questions, {
                PartitionKey: tables.questions,
                RowKey: uuid,
                active: true,
                number,
                questionText,
                answerText,                
                value
            });

            status = 200;
            result = {
                message: 'Question inserted',
                newId: uuid
            }    
        } catch (e) {            
            result.message = e.message;
        }        
    } else {
        result.message = 'The `questionText`, `answerText`, `value`, and `number` fields are all required';
    }

    context.res = {
        status,
        body: result
    };
};