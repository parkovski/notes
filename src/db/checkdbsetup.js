var db = require('./db');

var q = function(query) {
  db.query('CREATE TABLE IF NOT EXISTS ' + query);
}

module.exports = function() {
  /*
  [
    ''
  ].map(q);
  */
};
