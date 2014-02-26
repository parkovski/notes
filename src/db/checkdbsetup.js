var db = require('./db');

var makeSureTableExists = function(query) {
  db.query('CREATE TABLE IF NOT EXISTS ' + query + ';');
}

module.exports = function() {
  [
    'users (id serial PRIMARY KEY,'
      + ' name varchar(32),'
      + ' password binary(20),'
      + ' email varchar(48),'
      + ' theme tinyint DEFAULT 0)'
      + ' ENGINE=InnoDB DEFAULT CHARSET=utf8'
  ].map(makeSureTableExists);
};
