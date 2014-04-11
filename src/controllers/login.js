'use strict';

var passport = require('passport');
var userModel = require('../models/user');
var tokenModel = require('../models/token');

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

LoginController.prototype.yclogin = function(req, res, next) {
  req.body.username = 'notanemail@ycombinator.com';
  req.body.password = 'ycombinator';
  this.processLogin(req, res, next);
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

LoginController.prototype.facebookLogin = function(req, res, next) {
  if (req.user) {
    passport.authorize('facebook')(req, res, next);
  } else {
    passport.authenticate('facebook')(req, res, next);
  }
}

LoginController.prototype.facebookCallback = function(req, res, next) {
  // if we were authenticated, we're linking accounts from the settings page.
  if (req.user) {
    passport.authorize('facebook', {
      successRedirect: '/settings',
      failureRedirect: '/settings?error=Linking Facebook account failed.'
    })(req, res, next);
  } else {
    passport.authenticate('facebook', {
      successRedirect: '/registerlinked',
      failureRedirect: '/login?error=Facebook login failed.'
    })(req, res, function() {
      // This is such a hack, but I don't know how to get around it.
      // If passport succeeds but the account doesn't exist yet,
      // req.user will be set to a token that can be used to retrieve
      // the linked account fields, so we should clear it so
      // nobody thinks it's a real logged in user.
      var linkedAccountToken;
      if (typeof req.user === 'string') {
        linkedAccountToken = req.user;
        req.logout();
      }
      
      if (linkedAccountToken) {
        res.redirect('/registerlinked?token=' + linkedAccountToken);
      } else {
        res.redirect('/');
      }
    });
  }
};

LoginController.prototype.unlinkFacebook = function(req, res) {
  userModel.unlinkFacebook(req.user.id, function(err) {
    if (err) {
      return res.redirect('/settings?error=Couldn\'t unlink Facebook account.');
    }
    res.redirect('/settings');
  });
};

LoginController.prototype.googleLogin = function(req, res, next) {
  if (req.user) {
    passport.authorize('google')(req, res, next);
  } else {
    passport.authenticate('google')(req, res, next);
  }
}

LoginController.prototype.googleCallback = function(req, res, next) {
  // if we were authenticated, we're linking accounts from the settings page.
  if (req.user) {
    passport.authorize('google', {
      successRedirect: '/settings',
      failureRedirect: '/settings?error=Linking Google account failed.'
    })(req, res, next);
  } else {
    passport.authenticate('google', {
      failureRedirect: '/login?error=Google login failed.'
    })(req, res, function() {
      // Hack. See facebookCallback.
      var linkedAccountToken;
      if (typeof req.user === 'string') {
        linkedAccountToken = req.user;
        req.logout();
      }
      
      if (linkedAccountToken) {
        res.redirect('/registerlinked?token=' + linkedAccountToken);
      } else {
        res.redirect('/');
      }
    });
  }
};

LoginController.prototype.unlinkGoogle = function(req, res) {
  userModel.unlinkGoogle(req.user.id, function(err) {
    if (err) {
      return res.redirect('/settings?error=Couldn\'t unlink Google account.');
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
    jsmain: 'registeruser',
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

LoginController.prototype.showLinkedRegisterPage = function(req, res) {
  if (req.user) {
    return res.redirect('/');
  }
  if (!req.params.token) {
    return res.redirect('/login?error=Couldn\'t find linked account data.');
  }

  tokenModel.get(req.params.token, function(err, data) {
    if (err) {
      console.error(err);
      return res.redirect('/login?error=Linked account error.');
    }
    
    var linkedData = null;
    try {
      linkedData = JSON.parse(data);
    } catch (e) {
    } finally {
      if (!linkedData
          || !linkedData.provider
          || !linkedData.id
          || !linkedData.displayname
          || !linkedData.email) {
        
        return res.redirect('/login?error=Linked account error.');
      }
    }
    
    linkedData.token = req.params.token;
    
    res.render('register.html', {
      title: 'Register',
      jsmain: 'registeruser',
      error: 'error' in req.params,
      suppressLoginHeaderLink: true,
      linkedData: linkedData
    });
  });
};

LoginController.prototype.registerLinkedUser = function(req, res) {
  tokenModel.get(req.body.token, function(err, data) {
    if (err) {
      console.error(err);
      return res.redirect('/login?error=Linked account error.');
    }
    
    var linkedData = null;
    try {
      linkedData = JSON.parse(data);
    } catch (e) {
    } finally {
      if (!linkedData
          || !linkedData.provider
          || !linkedData.id
          || !linkedData.displayname) {
        
        return res.redirect('/login?error=Linked account error.');
      }
    }
    
    var userObj = {
      name: req.body.username,
      displayname: linkedData.displayname,
      email: req.body.email,
      password: req.body.password
    };
    var createUserMethod;
    if (linkedData.provider === 'Facebook') {
      userObj.facebookId = linkedData.id;
      createUserMethod = 'createFacebookUser';
    } else if (linkedData.provider === 'Google') {
      userObj.googleId = linkedData.id;
      createUserMethod = 'createGoogleUser';
    } else {
      console.error('Unknown account provider');
      return res.redirect('/login?error=Unknown account provider.');
    }
    
    userModel[createUserMethod](userObj, function(err, user) {
      if (err) {
        console.error(err);
      }
      // TODO: Auto login as the new user.
      res.redirect('/login');
    });
  });
};

module.exports = LoginController;
