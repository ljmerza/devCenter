const request = require('request');
const auth = require('basic-auth');
const http = require('http');

const port = 8888
const bot_registration_url = '';
const botId = '';
const secretKey = '';


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

    // get message and username
    let message = post.message;
    let username = post.from;
    let meeting_room;

    // if we have a pound sign then we are in a chat room so split the data
    if(username.includes('#')) {
      [meeting_room, username] = username.split('#');
      meeting_room = meeting_room.split(':')[1];
    }

    // if meeting room then don't do anything
    if(meeting_room){
      response.writeHead(200);
      return response.end();
    }


  }); // on request end
}); // http.createServer 


// listen for POST requests
server.listen(port);