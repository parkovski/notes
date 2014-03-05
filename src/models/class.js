var async = require('async');
var log4js = require('log4js');

var db = require('../db/db');

var logger = log4js.getLogger();

module.exports = {
  // cb = function(err, name)
  getName: function(classId, cb) {
    db.query(
      'SELECT `name` FROM `classes` WHERE `id` = ? LIMIT 1;',
      [classId],
      function(err, rows) {
        if (rows.length === 0) {
          cb(err, null);
        } else {
          cb(err, rows[0].name);
        }
      }
    );
  },
  // cb = function(err, isSubscribed)
  isUserSubscribed: function(classId, userId, cb) {
    db.query(
      'SELECT COUNT(*) AS `count` FROM `user_class_membership`'
        + ' WHERE `userid` = ? AND `classid` = ? LIMIT 1;',
      [userId, classId],
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
  subscribe: function(classId, userId, cb) {
    db.query(
      'INSERT INTO `user_class_membership` (`userId`, `classId`) VALUES (?, ?);',
      [userId, classId],
      cb
    );
  },
  // cb = function(err, success)
  unsubscribe: function(classId, userId, cb) {
    db.query(
      'DELETE FROM `user_class_membership` WHERE `userId` = ? AND `classId` = ?;',
      [userId, classId],
      cb
    );
  },
  // cb = function(err, classes)
  getUserClasses: function(userId, cb) {
    db.query(
      'SELECT * FROM `classes`'
      + ' INNER JOIN `user_class_membership`'
      + ' ON `classes`.`id` = `user_class_membership`.`classid`'
      + ' AND `user_class_membership`.`userid` = ?;',
      [userId],
      cb
    );
  },
  // cb = function(err, classId)
  create: function(orgId, name, topicTag, cb) {
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
