/* util.js */

function sortEntriesByNumber(entries) {
    if (entries) {
        return entries.sort((v1, v2) => {
            if (v1['number']['_'] > v2['number']['_']) return 1;
            if (v1['number']['_'] < v2['number']['_']) return -1;
            return 0;
        });
    }
}

module.exports = {
    sortEntriesByNumber
}