var express = require('express');
var passport = require('passport');
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
viewhelpers.setupAppForHandlebars(app);
viewhelpers.registerPartials();

var redisStore;
if (process.env.REDIS_CONFIG) {
  var redisConfig = JSON.parse(process.env.REDIS_CONFIG);
  redisStore = new RedisStore(redisConfig.port, redisConfig.host, redisConfig);
} else {
  redisStore = new RedisStore();
}

app.use('/style', express.static(__dirname + '/style'));
app.use('/clientjs', express.static(__dirname + '/clientjs'));
app.use(cookieParser());
app.use(session({
  store: redisStore,
  secret: 'omgwtfbbq',
  cookie: { maxAge: 3600000 }
}));
app.use(bodyParser());
app.use(passport.initialize());
app.use(passport.session());

var expressRouter = express.Router();
var router = new Router(expressRouter);
router.configureRoutes(require('./src/routes'));

app.use(expressRouter);

app.listen(process.env.PORT || 4000);

