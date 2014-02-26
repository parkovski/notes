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
  res.render('login.html', {
    title: 'Log in',
    suppressLoginHeaderLink: true,
    redirectUrl: req.query.r,
    errorMessage: req.query.error
  });
};

LoginController.prototype.processLogin = function(req, res, next) {
  var failureUrl = '/login/?error='
    + encodeURIComponent('Wrong username or password.');
  if (req.body.redirectUrl) {
    failureUrl += '&r=' + encodeURIComponent(req.body.redirectUrl);
  }
  passport.authenticate('local', {
    successRedirect: validateRedirectUrl(req.body.redirectUrl),
    failureRedirect: failureUrl
  })(req, res, next);
};

LoginController.prototype.logout = function(req, res) {
  req.logout();
  res.redirect('/');
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
    suppressLoginHeaderLink: true
  });
};

LoginController.prototype.registerUser = function(req, res) {
  userModel.createUser(
    {
      name: req.body.username,
      password: req.body.password,
      email: req.body.email
    },
    function(err, result) {
      if (err) {
        console.log(err);
        return res.redirect('/register');
      } else {
        return res.redirect('/login');
      }
    }
  );
};

module.exports = LoginController;
