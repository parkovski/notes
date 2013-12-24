var db = require('../db/db');
var sha1 = require('sha-1');

// dbresult can be null, in which case you just get an object representing the
// fields allowed on the user object, which you can test with hasOwnProperty.
var getUserFields = function(dbresult) {
  dbresult = dbresult || {};
  return {
    id: dbresult.id,
    name: dbresult.name,
    email: dbresult.email,
    theme: dbresult.theme
  };
};

var functions = {
  getPasswordHash: function(username, password) {
    return sha1(password + db.getSalt() + username.toLowerCase());
  },
  // cb = function(isUser)
  isUser: function(name, cb) {
    db.query(
      'SELECT COUNT(*) AS `count` FROM `users` WHERE LCASE(`name`) = LCASE(?);',
      [name],
      function(err, rows) {
        if (err) {
          return cb(false);
        } else if (rows.length === 0) {
          return cb(false);
        } else if (rows[0].count === 1) {
          return cb(true);
        }
        return cb(false);
      }
    );
  },
  // cb = function(err, user)
  getUser: function(name, password, cb) {
    db.query(
      'SELECT * FROM `users` WHERE LCASE(`name`) = LCASE(?) AND `password` = UNHEX(?);',
      [name, this.getPasswordHash(name, password)],
      function(err, rows) {
        if (err) {
          cb(err, null);
        } else if (rows.length === 1) {
          cb(null, getUserFields(rows[0]));
        } else {
          // no user
          cb(null, null);
        }
      }
    );
  },
  getUserById: function(id, cb) {
    db.query(
      'SELECT * FROM `users` WHERE `id` = ?;',
      [id],
      function(err, rows) {
        if (err) {
          cb(err, null);
        } else if (rows.length === 1) {
          cb(null, getUserFields(rows[0]));
        } else {
          cb(null, null);
        }
      }
    );
  },
  // cb = function(err, result)
  createUser: function(fields, cb) {
    db.query(
      'INSERT INTO `users` (name, password, email)'
      + ' SELECT ?, UNHEX(?), ? FROM `users`'
      + ' WHERE NOT EXISTS ('
      + '   SELECT * FROM `users` WHERE LCASE(`name`)=LCASE(?)'
      + ') LIMIT 1;',
      [
        fields.name,
        this.getPasswordHash(fields.name, fields.password),
        fields.email || '',
        fields.name
      ],
      cb
    );
  },
  // cb = function(err)
  changeFields: function(id, fields, cb) {
    var query = 'UPDATE `users` SET ';
    var allowedFields = getUserFields();
    var values = [];
    Object.keys(allowedFields).forEach(function(key) {
      if (fields.hasOwnProperty(key)) {
        query += '`' + key + '` = ? ';
        values.push(fields[key]);
      }
    });
    if (!values.length) {
      throw new Error('No valid fields were specified!');
    }
    if (typeof id !== 'number') {
      throw new Error('User ID must be a number');
    }
    query += 'WHERE `id` = ?;';
    values.push(id);

    db.query(query, values, cb);
  }
};

module.exports = functions;
