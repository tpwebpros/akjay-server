// async_storage.js
const azure = require('azure-storage');

async function createTable(svc, name) {
    return new Promise((resolve, reject) => {
        svc.createTableIfNotExists(name, (error, result, response) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

async function insertEntity(svc, table, entity) {
    return new Promise((resolve, reject) => {
        svc.insertEntity(table, entity, (error, result, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

async function queryEntities(svc, table, query) {
    return new Promise((resolve, reject) => {
        svc.queryEntities(table, query, null, (error, result, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

async function retrieveEntity(svc, table, partition, key) {
    return new Promise((resolve, reject) => {
        svc.retrieveEntity(table, partition, key, (error, result, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

async function deleteEntity(svc, table, entity) {
    return new Promise((resolve, reject) => {
        svc.deleteEntity(table, entity, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(true);
            }
        });
    });
}

async function mergeEntity(svc, table, entity) {
    return new Promise((resolve, reject) => {
        svc.mergeEntity(table, entity, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(true);
            }
        });
    });
}

module.exports = {
    createTable,
    insertEntity,
    queryEntities,
    retrieveEntity,
    deleteEntity,
    mergeEntity
}