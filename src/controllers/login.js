var passport = require('passport');
var userModel = require('../models/user');

function LoginController(app, configure) {
}

LoginController.prototype.showLoginPage = function(req, res) {
  this.render('login.html', {
    title: 'Log in',
    suppressLoginHeaderLink: true,
    user: req.user,
    errorMessage: req.query.error
  });
};

LoginController.prototype.processLogin = function(req, res) {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login/?error=Wrong username or password.'
  })(req, res);
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

  this.render('register.html', {
    title: 'Register',
    suppressLoginHeaderLink: true
  });
};

LoginController.prototype.registerUser = function(req, res) {
  var req = req, res = res;

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
