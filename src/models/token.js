/*
 * The token API generates a token that is used to access
 * pieces of data for a given user, for some period of time.
*/

var redis = require('../db/redis');
var hat = require('hat');

var redisClient = redis.createClient();

var DEFAULT_EXPIRE = 3600;

module.exports = {
  // optional callback = function(err, tokenId)
  // put also returns the tokenId. Use whichever is most convenient.
  put: function(data, expire, callback) {
    if (typeof expire === 'function') {
      callback = expire;
      expire = DEFAULT_EXPIRE;
    }
    if (!callback) {
      callback = function(){};
      if (typeof expire === 'undefined') {
        expire = DEFAULT_EXPIRE;
      }
    }
    
    var tokenId = hat();
    var tokenKey = 'token:' + tokenId;
    var multi = redisClient.multi().set(tokenKey, data);
    if (~expire) {
      multi.expire(tokenKey, expire);
    }
    multi.exec(function(err) {
      callback(err, tokenId);
    });
    
    return tokenId;
  },
  // stores a token and an association to retrieve it with the user ID and token name.
  // callback and return same as put.
  putForUser: function(userId, tokenName, data, expire, callback) {
    if (typeof expire === 'function') {
      callback = expire;
      expire = DEFAULT_EXPIRE;
    }
    if (!callback) {
      callback = function(){};
      if (typeof expire === 'undefined') {
        expire = DEFAULT_EXPIRE;
      }
    }
    
    var tokenId = hat();
    var tokenKey = 'token:' + tokenId;
    var userTokenKey = 'usertokens:' + userId + ':' + tokenName;
    var multi = redisClient.multi()
      .set(tokenKey, data)
      .set(userTokenKey, tokenId);
    if (~expire) {
      multi.expire(tokenKey, expire);
      multi.expire(userTokenKey, expire);
    }
    multi.exec(function(err) {
      callback(err, tokenId);
    });
    
    return tokenId;
  },
  // putIfNotExists does not return the token ID.
  // callback = function(err, tokenId, isNew)
  // callback is not optional.
  putIfNotExists: function(userId, tokenName, data, expire, callback) {
    redisClient.get('usertokens:' + userId + ':' + tokenName, function(err, tokenId) {
      if (err) {
        return callback(err);
      }
      if (tokenId) {
        return callback(err, tokenId, false);
      }
      module.exports.putForUser(userId, tokenName, data, expire, function(err, newTokenId) {
        callback(err, newTokenId, true);
      });
    });
  },
  // two forms: get(userId, tokenName, callback), get(tokenId, callback)
  // callback = function(err, tokenData)
  get: function(userId, tokenName, callback) {
    if (typeof tokenName === 'function') {
      // called get(tokenId, callback)
      var tokenId = userId;
      callback = tokenName;
      
      redisClient.get('token:' + tokenId, callback);
    } else {
      // called get(userId, tokenName, callback)
      redisClient.get('usertokens:' + userId + ':' + tokenName, function(err, data) {
        if (err) return callback(err);
        if (!data) return callback(null, null);
        module.exports.get('token:' + data, callback);
      });
    }
  }
};