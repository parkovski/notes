var mysql = require('mysql');

var async = require('async');

var config;
if (process.env.DB_CONFIG) {
  config = JSON.parse(process.env.DB_CONFIG);
} else {
  config = require('./config.json');
}
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

var getTransactionFunction = function(queryPair) {
  if (queryPair.vars) {
    return function(callback) {
      connection.query(queryPair.query, queryPair.vars, function(err, result) {
        callback(err, result);
      });
    };
  } else {
    return function(callback) {
      connection.query(queryPair.query, function(err, result) {
        callback(err, result);
      });
    };
  }
};

// queries = [{query: 'SELECT *...', vars: ['blahblah', ...]}]
// callback = function(err, result)
module.exports.transaction = function(queries, callback) {
  queries.unshift({ query: 'START TRANSACTION;' });
  queries.push({ query: 'COMMIT;' });
  async.series(queries.map(getTransactionFunction), function(err, results) {
    if (err) {
      return connection.query('ROLLBACK;', function() {
        callback(err);
      });
    }
    // remove results for START TRANSACTION and COMMIT
    results.shift(1);
    results.pop();
    callback(null, results);
  });
};
