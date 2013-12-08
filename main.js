var express = require('express');
var passport = require('passport');

require('./src/userauth')();

var app = express();
app.use('/style', express.static(__dirname + '/style'));
app.use('/clientjs', express.static(__dirname + '/clientjs'));
app.use(express.cookieParser());
app.use(express.session({ secret: 'omgwtfbbq', cookie: { maxAge: 60000 } }));
app.use(express.json());
app.use(express.urlencoded());
app.use(passport.initialize());
app.use(passport.session());
require('./src/routes')(app);

app.listen(4000);

