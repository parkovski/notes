var express = require('express');
var passport = require('passport');
var Router = require('./src/router');
var viewhelpers = require('./src/viewhelpers');

require('./src/userauth')();

var app = express();

viewhelpers.setupAppForHandlebars(app);
viewhelpers.registerPartials();

app.use('/style', express.static(__dirname + '/style'));
app.use('/clientjs', express.static(__dirname + '/clientjs'));
app.use(express.cookieParser());
app.use(express.session({ secret: 'omgwtfbbq', cookie: { maxAge: 3600000 } }));
app.use(express.json());
app.use(express.urlencoded());
app.use(passport.initialize());
app.use(passport.session());

var router = new Router(app);
router.configureRoutes(require('./src/routes'));
router.addLastResort();

app.listen(4000);

