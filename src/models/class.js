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
  // cb = function(err, {name, description})
  getNameAndDescription: function(classId, cb) {
    db.query(
      'SELECT `name`, `description` FROM `classes` WHERE `id` = ? LIMIT 1;',
      [classId],
      function(err, rows) {
        if (rows.length === 0) {
          cb(err, null);
        } else {
          cb(err, rows[0]);
        }
      }
    );
  },
  // cb = function(err)
  setDescription: function(classId, description, cb) {
    db.query(
      'UPDATE `classes` SET description = ? WHERE `id` = ?;',
      [description, classId],
      cb
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
    db.transaction(
      [
        {
          query: 'INSERT INTO `classes` (`orgid`, `name`) VALUES (?, ?);',
          vars: [orgId, name]
        },
        { query: 'SELECT LAST_INSERT_ID() AS `id`;' }
      ],
      function(err, results) {
        if (err) {
          return cb(err);
        }
        cb(null, results[1][0].id);
      }
    );
  },
  // cb = function(err, pageId)
  createPage: function(classId, cb) {
    db.transaction(
      [
        {
          query: 'INSERT INTO `note_pages` (`classid`) VALUES (?);',
          vars: [classId]
        },
        { query: 'SELECT LAST_INSERT_ID() AS `id`;' }
      ],
      function(err, results) {
        if (err) {
          logger.error(err);
          return cb(err);
        }
        cb(null, results[1][0].id);
      }
    );
  },
  // cb = function(err)
  setPageName: function(id, name, cb) {
    db.query('UPDATE `note_pages` SET `name` = ? WHERE `id` = ?;',
      [name, id],
      cb
    );
  },
  // cb = function(err, page)
  getPage: function(id, cb) {
    db.query('SELECT `classid`, `note_pages`.`name`, `classes`.`name` AS `classname` FROM `note_pages`'
      + ' INNER JOIN `classes` ON `classes`.`id` = `note_pages`.`classid`'
      + ' WHERE `note_pages`.`id` = ?;',
      [id],
      function(err, rows) {
        cb(null, rows && rows[0]);
      }
    );
  },
  // cb = function(err, pages)
  getClassPages: function(classId, cb) {
    db.query('SELECT * FROM `note_pages` WHERE `classid` = ?;',
      [classId],
      cb
    );
  }
};
