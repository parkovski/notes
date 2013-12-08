var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

module.exports = function() {
  passport.use(new LocalStrategy(function(username, password, done) {
    if (password === 'test' && username && username.length) {
      return done(null, username);
    }

    return done(null, false, { message: 'password must be test' });
  }));

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
};
