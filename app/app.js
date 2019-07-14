var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
// var logger = require('morgan');
var nunjucks = require('nunjucks');
var log4js = require('log4js');

var log = log4js.getLogger("app");

var logger = log4js.getLogger('app');

const myLog = require('./middlewares/myLogger');
const setUpNunjucks = require('./helpers/nunjucks_helpers.js');
var indexRouter = require('./routes/home');
var usersRouter = require('./routes/users');

var app = express();
app.use(log4js.connectLogger(log4js.getLogger("http"), { level: 'auto' }));

app.use(myLog)
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
setUpNunjucks(app)

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('dist'));

app.use('/', indexRouter);
app.use('/user', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
