'use strict';

var express = require('express');
var passport = require('passport');
var log4js = require('log4js');
log4js.replaceConsole();

var Router = require('./src/router');
var viewhelpers = require('./src/viewhelpers');

// middleware
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var RedisStore = require('connect-redis')(session);

require('./src/userauth')();

if (process.env.CHECK_DB_SETUP) {
  require('./src/db/checkdbsetup')();
}

var app = express();

viewhelpers.compileLessFiles();
viewhelpers.setupAppForSwig(app);

var redisStore;
if (process.env.REDIS_CONFIG) {
  var redisConfig = JSON.parse(process.env.REDIS_CONFIG);
  redisStore = new RedisStore(redisConfig);
} else {
  redisStore = new RedisStore();
}

app.use('/style', express.static(__dirname + '/style/css'));
app.use('/clientjs', express.static(__dirname + '/src/clientjs'));
app.use('/media', express.static(__dirname + '/media'));
app.use('/favicon.ico', function(req, res) {
  res.sendfile(__dirname + '/media/favicon.ico', { maxAge: 1000 * 60 * 60 * 24 });
});
app.use(cookieParser());
app.use(session({
  store: redisStore,
  secret: process.env.SESSION_SECRET || 'omgwtfbbq',
  cookie: { maxAge: null },
  resave: true,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

var expressRouter = express.Router();
var router = new Router(expressRouter);
router.configureRoutes(require('./src/routes'));

app.use(expressRouter);

app.listen(process.env.PORT || 4000);

