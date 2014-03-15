var passport = require('passport');
var userModel = require('../models/user');

// So that you can't redirect to another website.
function validateRedirectUrl(url) {
  if (!url) {
    return '/';
  }
  url = decodeURIComponent(url);
  if (url[0] === '/') {
    return url;
  }
  return '/';
}

function LoginController(configure) {
}

LoginController.prototype.showLoginPage = function(req, res) {
  if (req.user) {
    return res.redirect('/');
  }

  res.render('login.html', {
    title: 'Log in',
    suppressLoginHeaderLink: true,
    redirectUrl: req.query.r,
    errorMessage: req.query.error
  });
};

LoginController.prototype.processLogin = function(req, res, next) {
  var rememberMe = req.body.rememberMe;
  var redirectUrl = validateRedirectUrl(req.body.redirectUrl);
  var failureUrl = '/login/?error='
    + encodeURIComponent('Wrong username or password.');
  if (redirectUrl) {
    failureUrl += '&r=' + encodeURIComponent(redirectUrl);
  }
  passport.authenticate('local', {
    failureRedirect: failureUrl
  })(req, res, function() {
    if (req.body.rememberMe) {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
    }
    res.redirect(redirectUrl);
  });
};

LoginController.prototype.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};

LoginController.prototype.facebookLogin = passport.authenticate('facebook');

LoginController.prototype.facebookCallback = function(req, res, next) {
  var success = '/';
  var failure = '/login?error=Facebook login failed.';
  // if we were authenticated, we're linking accounts from the settings page.
  if (req.user) {
    success = '/settings';
    failure = '/settings?error=Linking facebook account failed.';
  }
  passport.authenticate('facebook', { 
    successRedirect: success,
    failureRedirect: failure
  });
};

LoginController.prototype.unlinkFacebook = function(req, res) {
  userModel.unlinkFacebook(req.user.id, function(err) {
    if (err) {
      return res.redirect('/settings?error=Couldn\'t unlink facebook account.');
    }
    res.redirect('/settings');
  });
};

LoginController.prototype.googleLogin = passport.authenticate('google');

LoginController.prototype.googleCallback = function(req, res, next) {
  var success = '/';
  var failure = '/login?error=Google login failed.';
  // if we were authenticated, we're linking accounts from the settings page.
  if (req.user) {
    success = '/settings';
    failure = '/settings?error=Linking google account failed.';
  }
  passport.authenticate('google', { 
    successRedirect: success,
    failureRedirect: failure
  });
};

LoginController.prototype.unlinkGoogle = function(req, res) {
  userModel.unlinkGoogle(req.user.id, function(err) {
    if (err) {
      return res.redirect('/settings?error=Couldn\'t unlink google account.');
    }
    res.redirect('/settings');
  });
};

LoginController.prototype.isUser = function(req, res) {
  if (!req.params.user) {
    return res.end('false');
  }
  userModel.isUser(req.params.user, function(isUser) {
    res.end('' + isUser);
  });
};

LoginController.prototype.showRegisterPage = function(req, res) {
  if (req.user) {
    return res.redirect('/');
  }

  res.render('register.html', {
    title: 'Register',
    error: 'error' in req.params,
    suppressLoginHeaderLink: true
  });
};

LoginController.prototype.registerUser = function(req, res) {
  userModel.createUser(
    {
      name: req.body.username,
      displayname: req.body.displayname,
      password: req.body.password,
      email: req.body.email
    },
    function(err) {
      if (err) {
        console.log(err);
        return res.redirect('/register?error');
      } else {
        return res.redirect('/login');
      }
    }
  );
};

module.exports = LoginController;
