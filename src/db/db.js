var mysql = require('mysql');

var config = require('./config.json');
// {host, user, password, database, salt}

function handleDisconnect() {
  connection = mysql.createConnection(config);

  connection.connect(function(err) {
    if(err) {
      console.log('error when connecting to db:', err);
      throw err;
      //setTimeout(handleDisconnect, 2000);
    }
  });

  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

module.exports.getSalt = function() {
  return config.salt || 'lolol default salt';
};

module.exports.query = function() {
  return connection.query.apply(connection, arguments);
};
