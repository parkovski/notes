var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var userModel = require('./models/user');

module.exports = function() {
  passport.use('local', new LocalStrategy(function(username, password, done) {
    // TODO: provide error messages
    return userModel.getUser(username, password, function(err, user) {
      if (user === null) {
        return done(err, false);
      }
      return done(err, user);
    });
  }));

  if (process.env.FACEBOOK_APPID && process.env.FACEBOOK_APPSECRET) {
    passport.use('facebook', new FacebookStrategy({
        clientID: process.env.FACEBOOK_APPID,
        clientSecret: process.env.FACEBOOK_APPSECRET,
        callbackURL: 'http://www.uanotes.com/connect/facebook/callback'
      },
      function(accessToken, refreshToken, profile, done) {
        userModel.fromFacebookId(profile.id, function(err, user) {
          // TODO: what do I do with the tokens?
          if (err) {
            return done(err);
          }
          if (user) {
            return done(null, user);
          }

          userModel.createFacebookUser(
            {
              name: 'fb:' + profile.id,
              displayname: profile.displayName,
              password: '',
              email: 'fb-' + profile.id + '@fixme.uanotes.com',
              facebookId: profile.id
            },
            function(err, user) {
              if (err || !user) {
                return done(err);
              }
              done(null, user);
            }
          );
        });
      }
    ));
  } else {
    console.log('facebook login not supported. add id and secret to enable.');
  }

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(userId, done) {
    return userModel.getUserById(userId, function(err, user) {
      done(err, user === null ? false : user);
    });
  });
};
