const request = require('request');
const mysql = require('mysql');
const querystring = require('querystring');

const keys = require('./keys');
const basicAuth = new Buffer(`${keys.jiraUsername}:${keys.jiraPassword}`).toString("base64");

const connection = mysql.createConnection({
    host: keys.dbUrl,
    user: keys.dbUsername,
    password: keys.dbPasssword,
    database: keys.dbDB
});

connection.connect();

/**
 * 
 * @param {*} startAt 
 */
function generateJiraUrl(startAt){
    const paramsObject = { ...keys.jiraTicketParams };
    paramsObject.startAt = startAt;
    const params = querystring.stringify(paramsObject);
    
    const url = `${keys.jiraBaseUrl}/${keys.jiraTicketPath}?${params}`;
    return url
}

/**
 * 
 * @param {*} url 
 */
async function getTickets(url){
    return new Promise((resolve, reject) => {

        const options = {
            rejectUnauthorized: false,
            url,
            method: "GET",
            headers: {
                Authorization: `Basic ${basicAuth}`
            }
        };

        request.get(options, function (error, response, body){
            if(error) return reject(error);

            try {
                const response = JSON.parse(body);
                return resolve(response.issues);
            } catch(e){
                return reject(e);
            }

        })
    });
}

/**
 * 
 * @param {*} ticket 
 */
async function saveTicket(ticket){
    return new Promise((resolve, reject) => {

        // see if the ticket already exists
        const searchQuery = `SELECT * from ticket_history WHERE \`key\` = '${ticket.key}'`;
        
        connection.query(searchQuery, function (error, results, fields) {
            if (error) return reject(error);
            
            const timeTracking = JSON.stringify(ticket.fields.timetracking || {});
            const fixVersions = formatFixVersion(ticket.fields.fixVersions || {})
            const histories = formatHistory(ticket.changelog.histories || []);
            const assignee = ticket.fields.assignee && ticket.fields.assignee.name || '';
            
            let query = `INSERT INTO ${keys.dbTable} (assignee, time_tracking, changelog, fix_version, \`key\`) VALUES (?,?,?,?,?)`;
            let updateType = 'INSERT';

            if (results.length) {
                query = `UPDATE ${keys.dbTable} SET assignee = ?, time_tracking = ?, changelog = ?, fix_version = ? WHERE \`key\` = ?`;
                updateType = 'UPDATE';
            }

            console.log(`${updateType} ${ticket.key}`);
            connection.query(query, [assignee, timeTracking, histories, fixVersions, ticket.key], error => {
                if (error) return reject(error);
                return resolve();
            });

            
            
        });
    });
}

/**
 * 
 * @param {*} history 
 */
function formatHistory(history){
    const statusChanges = [];

    history.forEach(history => {
        history.items.forEach(item => {
            if (['status','Component'].includes(item.field)){
                statusChanges.push({
                    author: history.author.name,
                    status: {
                        to: item.toString,
                        from: item.fromString,
                        created: history.created
                    }
                });
            }
        });
    });

    return JSON.stringify(statusChanges);
}

/**
 * 
 * @param {*} fixVersion 
 */
function formatFixVersion(fixVersion){
    return JSON.stringify({
        releaseDate: fixVersion[0] && fixVersion[0].releaseDate || '',
        name: fixVersion[0] && fixVersion[0].name || '',
    });
}

(async () => {

    let startAt = keys.jiraTicketParams.startAt;
    let listIndexes = [0];
    while (startAt <= keys.endAt){
        startAt += keys.jiraTicketParams.maxResults
        listIndexes.push(startAt);
    }

    for await (let startAt of listIndexes) {
        const url = generateJiraUrl(startAt);

        try {
            const tickets = await getTickets(url);
            console.log(`found ${tickets.length} tickets`);

            if (tickets.length == 0) {
                connection.end();
                return;
            }
            
            for await(let ticket of tickets){
                await saveTicket(ticket);
            }

        } catch(e){
            console.log(e);
        }
    }

    connection.end();
})();