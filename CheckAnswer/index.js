const azure = require('azure-storage');
const uuidv1 = require('uuid/v1');
const stripJs = require('strip-js');
const storage = require('../Shared/async_storage');

const questionTableName = 'questions';
const teamTableName = 'teams';
const gameTableName = 'games';

module.exports = async function (context, req) {
    context.log('In `CheckAnswer`');

    const tableSvc = azure.createTableService();
    const body = req.body;

    let result = {
        message: 'Error'
    }

    let status = 500;
    
    if (req.params.gameId &&
        body.hasOwnProperty('questionId') &&
        body.hasOwnProperty('answerText') &&
        body.hasOwnProperty('teamId')        
    ) {  
        const answerText = stripJs(isNaN(body.answerText) ? body.answerText.trim() : body.answerText.toString());            
        const questionId = body.questionId;
        const teamId = body.teamId;
        const gameId = req.params.gameId;

        try {
            await storage.createTable(tableSvc, questionTableName);
            await storage.createTable(tableSvc, teamTableName);
            await storage.createTable(tableSvc, teamTableName);

            // retrieve the associated game to check that the question is attached to it
            const gameResult = await storage.retrieveEntity(tableSvc, gameTableName, 'games', gameId);
            const associatedQuestions = JSON.parse(gameResult.questions._);

            if (!associatedQuestions.includes(questionId)) {
                throw new Error('The provided question is not a part of the provided game.');
            }

            // attempt to retrieve a question by number and answer
            const questionResult = await storage.queryEntities(tableSvc, questionTableName, new azure.TableQuery()
                .select(['RowKey','number','value'])
                .where('RowKey eq ? and answerText eq ?', questionId, answerText));
            
            result.code = 'nomatch';
            result.message = 'No matching question was found.';

            if (questionResult.entries.length) {
                // a valid question and answer combination was found, retrieve the team and give them some points
                let team = await storage.retrieveEntity(tableSvc, teamTableName, 'teams', teamId);
                let answeredQuestions = [];

                if (team.answeredQuestions) {
                    answeredQuestions = JSON.parse(team.answeredQuestions._);
                }

                if (answeredQuestions.includes(questionId)) {
                    throw new Error('The provided team has already successfully answered this question. No double dipping!');
                }

                answeredQuestions.push(questionId);
                team.answeredQuestions = JSON.stringify(answeredQuestions);
                team.score._ += questionResult.entries[0].value._;                                

                await storage.mergeEntity(tableSvc, teamTableName, team);
                result.message = `Team "${team.name._}" score increased to ${team.score._} for matching answer.`;                
                result.code = 'match';
            }

            status = 200;
        } catch (e) {            
            result.message = e.message;
        }        
    } else {
        result.message = 'The `questionNumber`, `answerText`, and `teamId` fields are all required.';
    }

    context.res = {
        status,
        body: result
    };
};