const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const profile = require('./routes/profile');
const git = require('./routes/git');
const jira = require('./routes/jira');
const navbar = require('./routes/navbar');
const comments = require('./routes/comments');

let app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/dev_center/jira/profile', profile);
app.use('/dev_center/jira/comments', comments);
app.use('/dev_center/git', git);
app.use('/dev_center/jira', jira);
app.use('/dev_center/navbar', navbar);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
