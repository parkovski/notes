var db = require('../db/db');

module.exports = {
  // cb = function(err, rows)
  searchClasses: function(query, cb) {
    db.query('SELECT * FROM `classes` WHERE MATCH (`name`) AGAINST (?);',
      [query],
      cb
    );
  },
  searchOrgs: function(query, cb) {
    db.query('SELECT * FROM `orgs` WHERE MATCH (`name`) AGAINST (?);',
      [query],
      cb
    );
  }
};
