'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var userModel = require('./models/user');
var tokenModel = require('./models/token');

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
        callbackURL: 'http://www.uanotes.com/connect/facebook/callback',
        passReqToCallback: true
      },
      function(req, accessToken, refreshToken, profile, done) {
        if (req.user) {
          userModel.linkFacebook(req.user.id, profile.id, function(err) {
            done(err, profile);
          });
        } else {
          userModel.fromFacebookId(profile.id, function(err, user) {
            // TODO: what do I do with the tokens?
            if (err) {
              return done(err);
            }
            if (user) {
              return done(null, user);
            }

            tokenModel.put({
              provider: 'Facebook',
              id: profile.id,
              displayname: profile.displayName,
              email: profile.email,
            }, function(err, tokenId) {
              if (err) {
                return done(err);
              }
              // TODO: This is probably wrong.
              // See the rest of this hack in login.js.
              done(null, tokenId);
            });
          });
        }
      }
    ));
  } else {
    console.warn('Facebook login not supported. Add id and secret to enable.');
  }

  if (process.env.GOOGLE_APPID && process.env.GOOGLE_APPSECRET) {
    passport.use('google', new GoogleStrategy({
        clientID: process.env.GOOGLE_APPID,
        clientSecret: process.env.GOOGLE_APPSECRET,
        callbackURL: 'http://www.uanotes.com/connect/google/callback',
        scope: [
          'https://www.googleapis.com/auth/plus.me',
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile'
        ],
        passReqToCallback: true
      },
      function(req, accessToken, refreshToken, profile, done) {
        if (req.user) {
          userModel.linkGoogle(req.user.id, profile.id, function(err) {
            done(err, profile);
          });
        } else {
          userModel.fromGoogleId(profile.id, function(err, user) {
            // TODO: what do I do with the tokens?
            if (err) {
              return done(err);
            }
            if (user) {
              return done(null, user);
            }

            tokenModel.put({
              provider: 'Google',
              id: profile.id,
              displayname: profile.displayName,
              email: profile.email,
            }, function(err, tokenId) {
              if (err) {
                return done(err);
              }
              // TODO: This is probably wrong.
              done(null, tokenId);
            });
          });
        }
      }
    ));
  } else {
    console.warn('Google login not supported. Add id and secret to enable.');
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
