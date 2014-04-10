'use strict';

var redis = require('redis');

var config = JSON.parse(process.env.REDIS_CONFIG || '{}');

var port = config.port;
var host = config.host;

// expose all redis functions
Object.keys(redis).forEach(function(key) {
  exports[key] = redis[key];
});

// replace createClient to use REDIS_CONFIG.
exports.createClient = function() {
  return redis.createClient(port, host, config);
};