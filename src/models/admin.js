'use strict';

var db = require('../db/db');

exports.isUserAdmin = function(user) {
  // Hack
  return user && user.name === 'parker';
};

// callback = function(err, users)
exports.getUserCount = function(callback) {
  db.query('SELECT COUNT(*) AS `count` FROM `users`;', function(err, result) {
    callback(err, result && result[0] && result[0].count);
  });
};