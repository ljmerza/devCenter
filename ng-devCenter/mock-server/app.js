const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
let app = express();

const port = process.env.PORT || '3000';
app.set('port', port);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const profile = require('./routes/profile');
const git = require('./routes/git');
const jira = require('./routes/jira');
const navbar = require('./routes/navbar');
const comments = require('./routes/comments');
const qaGenerator = require('./routes/qa-generator');

app.use('/dev_center/jira/profile', profile);
app.use('/dev_center/jira/comment', comments);
app.use('/dev_center/git', git);
app.use('/dev_center/jira', jira);
app.use('/dev_center/navbar', navbar);
app.use('/dev_center', qaGenerator);

app.use(function(err, req, res, next) {
	res.json(err);
});

let server = http.createServer(app);
server.listen(port);
