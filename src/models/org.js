var db = require('../db/db');

var functions = {
  // cb = function(err, classes)
  getClasses: function(orgId, cb) {
    db.query(
      'SELECT * FROM `classes` WHERE `orgid` = ?;',
      [orgId],
      cb
    );
  },
  // cb = function(err, name)
  getName: function(orgId, cb) {
    db.query(
      'SELECT name FROM `orgs` WHERE `id` = ? LIMIT 1;',
      [orgId],
      function(err, rows) {
        if (rows.length === 0) {
          cb(err, null);
        } else {
          cb(err, rows[0].name);
        }
      }
    );
  }
};

module.exports = functions;
