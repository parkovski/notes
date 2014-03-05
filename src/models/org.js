var async = require('async');
var log4js = require('log4js');

var db = require('../db/db');

var logger = log4js.getLogger();

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
  },
  // cb = function(err, classId)
  createClass: function(orgId, name, topicTag, cb) {
    var start = function(callback) {
      db.query('START TRANSACTION;', function(err) { callback(err); });
    };
    var create = function(callback) {
      db.query('INSERT INTO `classes` (`orgid`, `name`) VALUES (?, ?);',
        [orgId, name],
        function(err) { callback(err); }
      );
    };
    var selectId = function(callback) {
      db.query('SELECT LAST_INSERT_ID() AS `id`;',
        function(err, result) { callback(err, result); });
    };
    var commit = function(result, callback) {
      db.query('COMMIT;', function(err) { callback(err, result); });
    };

    async.waterfall([start, create, selectId, commit], function(err, result) {
      if (err) {
        logger.error(err);
        return db.query('ROLLBACK;', function() {
          cb(err);
        });
      }
      cb(null, result[0].id);
    });
  }
};

module.exports = functions;
