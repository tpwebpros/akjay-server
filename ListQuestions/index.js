const azure = require('azure-storage');
const uuidv1 = require('uuid/v1');
const stripJs = require('strip-js');
const storage = require('../Shared/async_storage');

const sortEntriesByNumber = require('../Shared/util').sortEntriesByNumber;

const tableName = 'questions';
const gameTableName = 'games';

module.exports = async function (context, req) {
    context.log('In `ListQuestions`');
    const tableSvc = azure.createTableService();    

    let result = {
        message: 'Error'
    }

    let status = 500;    
        
    try {
        const gameId = (req.query.gameId) ? req.query.gameId : null;
        let gameQuestions = null;

        if (gameId) {
            const existingGame = await storage.retrieveEntity(tableSvc, gameTableName, 'games', gameId);            
            if (!existingGame) throw new Error('Requested game does not exist');

            gameQuestions = JSON.parse(existingGame.questions._);
        }

        const queryResult = await storage.queryEntities(tableSvc, tableName, new azure.TableQuery().where('active eq ?', true));       
        const rawQuestions = sortEntriesByNumber(queryResult.entries);

        status = 200;            
        
        let questions = [];
        rawQuestions.forEach((question) => {
            if (gameQuestions && gameQuestions.includes(question.RowKey._) || !gameQuestions) {
                questions.push(Object.keys(question).reduce((acc, k) => {
                    acc[k] = question[k]['_'];
                    return acc;
                }, {}));
            }
        });

        result.message = `Question(s) retrieved`;
        result.count = questions.length;
        result.data = questions;
    } catch (e) {
        result.message = e.message;
    }

    context.res = {
        status,
        body: result
    }
};