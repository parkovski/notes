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

LoginController.prototype.facebookCallback
  = passport.authenticate('facebook', { 
    successRedirect: '/',
    failureRedirect: '/login'
  }
);

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
