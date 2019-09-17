const azure = require('azure-storage');
const uuidv1 = require('uuid/v1');
const stripJs = require('strip-js');
const storage = require('../Shared/async_storage');
const tables = require('../Shared/constants').tableNames;

module.exports = async function (context, req) {
    context.log('In `AddQuestionToGame`');

    const tableSvc = azure.createTableService();
    const body = req.body;

    let result = {
        message: 'Error'
    }

    let status = 500;
    
    if (req.params.gameId && body.hasOwnProperty('questionId'))
    {  
        const gameId = req.params.gameId;  
        const questionId = req.body.questionId;

        try {
            await storage.createTable(tableSvc, tables.games);

            // retrieve and sort existing questions by number
            let existingGame = await storage.retrieveEntity(tableSvc, tables.games, tables.games, gameId);
            let associatedQuestions = (existingGame.questions) ? JSON.parse(existingGame.questions._) : [];

            if (associatedQuestions.includes(questionId)) {
                throw new Error('Question is already associated with this game.');
            }

            associatedQuestions.push(questionId);
            existingGame.questions = JSON.stringify(associatedQuestions);

            await storage.mergeEntity(tableSvc, tables.games, existingGame);

            status = 200;
            result = {
                message: 'Question added to game'
            }    
        } catch (e) {            
            result.message = e.message;
        }        
    } else {
        result.message = 'The `gameId` URL parameter and `questionId` body parameter are both required.';
    }

    context.res = {
        status,
        body: result
    };
};