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
      'SELECT `name` FROM `orgs` WHERE `id` = ? LIMIT 1;',
      [orgId],
      function(err, rows) {
        if (rows.length === 0) {
          cb(err, null);
        } else {
          cb(err, rows[0].name);
        }
      }
    );
  },
  // cb = function(err, isJoined)
  isUserJoined: function(orgId, userId, cb) {
    db.query(
      'SELECT COUNT(*) AS `count` FROM `user_org_membership`'
        + ' WHERE `userid` = ? AND `orgid` = ? LIMIT 1;',
      [userId, orgId],
      function(err, rows) {
        if (rows.length === 0) {
          cb(err, null);
        } else {
          cb(err, rows[0].count === 1);
        }
      }
    );
  },
  // cb = function(err, success)
  joinUser: function(orgId, userId, cb) {
    db.query(
      'INSERT INTO `user_org_membership` (`userid`, `orgid`) VALUES (?, ?);',
      [userId, orgId],
      cb
    );
  },
  // cb = function(err, success)
  unjoinUser: function(orgId, userId, cb) {
    db.query(
      'DELETE FROM `user_org_membership` WHERE `userid` = ? AND `orgid` = ?;',
      [userId, orgId],
      cb
    );
  }
};

module.exports = functions;
