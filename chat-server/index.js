const request = require('request');
const auth = require('basic-auth');
const http = require('http');
const mysql = require('promise-mysql');
const Promise = require("bluebird");

const port = 8888
const bot_registration_url = '';
const botId = '';
const secretKey = '';

const attuid = ''
const sql_host = '';
const sql_password = '';
const sql_db = ''

let pool = mysql.createPool({
  host     : sql_host,
  user     : attuid,
  password : sql_password,
  database : sql_db
});

// Register the URL for the bot with Q
request
  .post(bot_registration_url, {
    proxy: '',
    body: `http://auto:${port}`
  })
  .auth(botId, secretKey);


// start chat listening server
let server = http.createServer( (request, response) => {

  // only allow POST requests
  if (request.method !== 'POST') {
    return;
  }

  // data from POST request
  let body_data = '';

  // on data receive get data
  request.on('data', (data) => {
    body_data += data;
  });

  // on end of getting data parse the data
  request.on('end', () => {
    // parse data to JSON
    let post = JSON.parse(body_data);

    // get message and attuid
    let message = post.message;
    let attuid = post.from;
    let meeting_room;

    // if we have a pound sign then we are in a chat room so split the data
    if(attuid.includes('#')) {
      [meeting_room, attuid] = attuid.split('#');
      meeting_room = meeting_room.split(':')[1];
    }

    // if meeting room then don't do anything
    if(meeting_room){
      response.writeHead(200);
      return response.end();
    }

    // print out data we got so far
    console.log('meeting_room: ', meeting_room);
    console.log('attuid: ', attuid);
    console.log('message: ', message);

    // if message begins with hey bot then process message and return message back to requester
    if(/^hey bot,?/i.test(message)) {

      // get a message
      process_message(message, attuid)
      .then( (return_message) => {

        // print separator for next request
        console.log('-----------------------------');

        // return response to requester
        response.writeHead(200);
        response.write(`${return_message}`);
        return response.end();

      }); //return promise from process_message
    } // if hey bot

  }); // on request end
}); // http.createServer 


// listen for POST requests
server.listen(Number(port));


/********************************************************************
* function process_message(message, attuid)
*   processes the user's message to see what they want from the bot
* *******************************************************************/
function process_message(message, attuid) {

  return new Promise( (resolve, reject) => {
    // data we will return to requester
    let return_message;
    let update_field;
    let update_value;

    // object used to update SQL
    let updates = {
      attuid: attuid,
      all: 0,
      new: 0,
      conflict: 0,
      cr_fail: 0,
      uct_fail: 0,
      never_ping: 0
    }

    // show beta stats
    if(/beta stats/i.test(message)){
      return resolve(`beta stats`);
    }

    // show user data by getting data -> wait for response then return promise
    else if(/show/i.test(message)){
      return get_user_data(attuid)
      .then( (return_message) => {
        return resolve(return_message);
      });
    }

    // see if user wants to add ticket messages
    else if(/add/i.test(message)){
      if(/add new/i.test(message)){
        update_field = 'new_ping';
        update_value = 1;
        return_message = `new`;

      } else if(/add merge conflict/i.test(message)){
        update_field = 'conflict_ping';
        update_value = 1;
        return_message = `merge conflict`;

      } else if(/addcr cr fail/i.test(message)){
        update_field = 'cr_fail_ping';
        update_value = 1;
        return_message = `CR fail`;

      } else if(/add uct fail/i.test(message)){
        update_field = 'uct_fail_ping';
        update_value = 1;
        return_message = `UCT fail`;

      } else if(/add all/i.test(message)){
        update_field = 'all_ping';
        update_value = 1;
        return_message = `all`;

      } else if(/add merge code/i.test(message)){
        update_field = 'merge_ping';
        update_value = 1;
        return_message = `merge code`;
      }
    }

    // see if user wants to remove ticket messages
    else if(/remove/i.test(message)){
      if(/remove new/i.test(message)){
        update_field = 'new';
        update_value = 0;
         return_message = `new`;

      } else if(/remove merge conflict/i.test(message)){
        update_field = 'merge_ping';
        update_value = 0;
        return_message = `merge conflict`;

      } else if(/remove cr fail/i.test(message)){
        update_field = 'cr_fail_ping';
        update_value = 0;
        return_message = `CR fail`;

      } else if(/remove uct fail/i.test(message)){
        update_field = 'uct_fail_ping';
        update_value = 0;
        return_message = `UCT fail`;

      } else if(/remove all/i.test(message)){
        update_field = 'all_ping';
        update_value = 0;
        return_message = `any`;

      } else if(/remove merge code/i.test(message)){
        update_field = 'merge_ping';
        update_value = 0;
        return_message = `merge code`;
      }

    }

    let is_not = typeof(update_value) !== "undefined" ? (update_value === 0 ? 'not ' : '') : '';
    let message_to_user = `You will ${is_not}recieve ${return_message} jira ticket messages`

    // if we need to update the db then do that
    if(update_field && attuid) {
      // wait for user profile update then return message
      modify_user(update_field, update_value, attuid)
      .then( (modify_user_message) => {
        console.log('modify_user_message: ', modify_user_message);
        return resolve(message_to_user);
      });

    } else {
      // else no matching messages
      return resolve(help_menu);
    }

  });
}

/********************************************************************
* function modify_user(update_field, update_value, attuid)
*   modifies a user's settings in the db
* *******************************************************************/
function modify_user(update_field, update_value, attuid) {

  return new Promise( (resolve, reject) => {

    // get connection from pool
    pool.getConnection()
    .then( (connection) => {
    
      // see if user exists first
      connection.query('SELECT * FROM `who_to_ping` WHERE attuid = ?', [attuid])
      .then( (results, fields) => {
        
        // if user exists then update row
        if(results[0] && results[0].attuid == attuid) {

          connection.query(`UPDATE who_to_ping SET ${update_field}=? WHERE attuid = ?`, [update_value, attuid])
          .then( (error, results, fields) => {
            return resolve(`updated user ${attuid} with ${update_field} set to ${update_value}`);
          }); // end update suer

        } else {

          // else add new user with requested row values
          connection.query(`INSERT INTO who_to_ping (${update_field}, attuid) VALUES (?, "?")`, [update_value, attuid])
          .then( (results, fields) => {
            return resolve(`added new ${attuid} with ${update_field} set to ${update_value}`);
          }); // end insert user data
        } // end else 

      }); // end select user
    }); // end then connection
  }); // end promise returned
}

/********************************************************************
* function get_user_data(attuid)
*   gets a user's profile settings from the db
* *******************************************************************/
function get_user_data(attuid) {

  return new Promise( (resolve, reject) => {
    // get connection from pool
    pool.getConnection()
    .then( (connection) => {

      // see if user exists first
      connection.query('SELECT * FROM `who_to_ping` WHERE attuid = ?', [attuid])
      .then( (results, fields) => {
      
        // if user exists then get data
        if(results[0]) {
          let all_ping = results[0].all_ping ? 'Yes' : 'No';
          let new_ping = results[0].new_ping ? 'Yes' : 'No';
          let conflict_ping = results[0].conflict_ping ? 'Yes' : 'No';
          let cr_fail_ping = results[0].cr_fail_ping ? 'Yes' : 'No';
          let uct_fail_ping = results[0].uct_fail_ping ? 'Yes' : 'No';
          let merge_ping = results[0].merge_ping ? 'Yes' : 'No';
          let never_ping = results[0].never_ping ? 'Yes' : 'No';

          return resolve(`
            <br>attuid: ${attuid}<br>
            all ping: ${all_ping}<br>
            new ping: ${new_ping}<br>
            conflict ping: ${conflict_ping}<br>
            cr fail ping: ${cr_fail_ping}<br>
            uct fail ping: ${uct_fail_ping}<br>
            merge ping ${merge_ping}<br>
          `);

        } else {
          // else return generic message
         return resolve('You are not set in the system.');
        }

      }); // select a user
    }); // get a connection
  }); // return a promise
}


// the default help message
const help_menu = `
  <br>To use me, say '<b>hey bot add/remove </b>' then the type of messages you want to add or remove.<br>
  For example say '<b>hey bot add new</b>' to receive all new ticket messages
  or send '<b>hey bot remove new</b>' to stop receiving all new ticket messages.<br><br>
  <b>Here is is list of commands:</b>
  <br>

  hey bot add/remove all<br>
  hey bot add/remove new<br>
  hey bot add/remove merge code<br>
  hey bot add/remove cr fail<br>
  hey bot add/remove uct fail<br>
  hey bot add/remove merge conflict<br>
  <br>

  You can view your settings with '<b>hey bot show<b>'
`;