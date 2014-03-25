var redis = require('redis');

var config = JSON.parse(process.env.REDIS_CONFIG || '{}');

var port = config.port;
  var host = config.host;

exports.createClient = function() {
  return redis.createClient(port, host, config);
};