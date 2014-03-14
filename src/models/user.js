var db = require('../db/db');
var sha1 = require('sha-1');

// dbresult can be null, in which case you just get an object representing the
// fields allowed on the user object, which you can test with hasOwnProperty.
var getUserFields = function(dbresult) {
  dbresult = dbresult || {};
  return {
    id: dbresult.id,
    name: dbresult.name,
    displayname: dbresult.displayname,
    email: dbresult.email,
    theme: dbresult.theme
  };
};

var getPasswordHash = function(username, password) {
  return sha1(password + db.getSalt() + username.toLowerCase());
};

var functions = {
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
      [name, getPasswordHash(name, password)],
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
  // cb = function(err)
  createUser: function(fields, cb) {
    var createUserQuery = {
      query: 'INSERT INTO `users` (`name`, `displayname`, `password`, `email`)'
        + ' SELECT ?, ?, UNHEX(?), ? FROM `users`'
        + ' WHERE NOT EXISTS ('
        + '   SELECT * FROM `users` WHERE LCASE(`name`)=LCASE(?)'
        + ') LIMIT 1;',
      vars: [
        fields.name,
        fields.displayname,
        getPasswordHash(fields.name, fields.password),
        fields.email || '',
        fields.name
      ]
    };
    var addToHelpOrgQuery = {
      query: 'INSERT INTO `user_org_membership` (`userid`, `orgid`)'
        + ' VALUES (LAST_INSERT_ID(), 1);'
    };
    var addToGettingStartedQuery = {
      query: 'INSERT INTO `user_class_membership` (`userid`, `classid`)'
        + ' VALUES (LAST_INSERT_ID(), 1);'
    };

    db.transaction([
        createUserQuery,
        addToHelpOrgQuery,
        addToGettingStartedQuery
      ],
      function(err, results) {
        cb(err);
      }
    );
  },
  // cb = function(err, user)
  fromFacebookId: function(fbid, cb) {
    db.query('SELECT * FROM `users` WHERE `id` = '
      + '(SELECT `userid` FROM `facebook_users` WHERE `fbid` = ?);',
      [fbid],
      function(err, rows) {
        if (err) {
          return cb(err);
        }
        if (!rows || !rows.length) {
          return cb(null);
        }
        return cb(null, getUserFields(rows[0]));
      }
    );
  },
  // cb = function(err)
  linkFacebook: function(userId, facebookId, cb) {
    db.query(
      'INSERT INTO `facebook_users` (`fbid`, `userid`)'
      + ' VALUES (?, ?);',
      [facebookId, userId],
      cb
    );
  },
  // cb = function(err, user)
  createFacebookUser: function(fields, cb) {
    var createUserQuery = {
      query: 'INSERT INTO `users` (`name`, `displayname`, `password`, `email`)'
        + ' SELECT ?, ?, UNHEX(\'\'), ? FROM `users`'
        + ' WHERE NOT EXISTS ('
        + '   SELECT * FROM `users` WHERE LCASE(`name`)=LCASE(?)'
        + ') LIMIT 1;',
      vars: [
        fields.name,
        fields.displayname,
        fields.email || '',
        fields.name
      ]
    };
    var createFacebookLinkQuery = {
      query: 'INSERT INTO `facebook_users` (`fbid`, `userid`)'
        + ' VALUES (?, LAST_INSERT_ID());',
      vars: [fields.facebookId]
    };
    var addToHelpOrgQuery = {
      query: 'INSERT INTO `user_org_membership` (`userid`, `orgid`)'
        + ' VALUES (LAST_INSERT_ID(), 1);'
    };
    var addToGettingStartedQuery = {
      query: 'INSERT INTO `user_class_membership` (`userid`, `classid`)'
        + ' VALUES (LAST_INSERT_ID(), 1);'
    };
    var selectUserQuery = {
      query: 'SELECT * FROM `users` WHERE `id` = LAST_INSERT_ID();'
    };

    db.transaction([
        createUserQuery,
        createFacebookLinkQuery,
        addToHelpOrgQuery,
        addToGettingStartedQuery,
        selectUserQuery
      ],
      function(err, results) {
        cb(err, results && results[4] && getUserFields(results[4][0]));
      }
    );
  },
  // cb = function(err, passwordOk)
  changeFields: function(id, name, password, fields, cb) {
    db.query('SELECT COUNT(*) AS `count` FROM `users`'
      + ' WHERE `id` = ?'
      + ' AND `password` = UNHEX(?);',
      [id, getPasswordHash(name, password)],
      function(err, rows) {
        if (err) return cb(err);
        if (rows.length === 0) return cb(null, false);
        if (rows[0].count !== 1) return cb(null, false);
        functions.changeFieldsWithoutPassword(id, name, fields,
          function(err) {
            cb(err, true);
          }
        );
      }
    );
  },
  // cb = function(err)
  changeFieldsWithoutPassword: function(id, name, fields, cb) {
    var query = 'UPDATE `users` SET ';
    var allowedFields = getUserFields();
    var values = [];
    var firstField = true;
    Object.keys(allowedFields).forEach(function(key) {
      if (fields.hasOwnProperty(key)) {
        if (firstField) {
          firstField = false;
        } else {
          query += ', ';
        }
        query += '`' + key + '` = ? ';
        values.push(fields[key]);
      }
    });
    // special case
    if ('password' in fields) {
      if (!firstField) {
        query += ', ';
      }
      query += '`password` = UNHEX(?) ';
      values.push(getPasswordHash(name, fields.password));
    }
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
