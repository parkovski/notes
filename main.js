var express = require('express');

var app = express();
app.use('/style', express.static(__dirname + '/style'));
app.use('/clientjs', express.static(__dirname + '/clientjs'));
require('./src/routes')(app);

app.listen(4000);

