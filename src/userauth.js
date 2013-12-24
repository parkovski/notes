var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var userModel = require('./models/user');

module.exports = function() {
  passport.use(new LocalStrategy(function(username, password, done) {
    // TODO: provide error messages
    return userModel.getUser(username, password, function(err, user) {
      if (user === null) {
        return done(err, false);
      }
      return done(err, user);
    });
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(userId, done) {
    return userModel.getUserById(userId, function(err, user) {
      done(err, user === null ? false : user);
    });
  });
};
