var passport = require('passport');

module.exports = function(app) {
  app.get('/login', function(req, res) {
    res.render('login.html', { title: 'Log in', suppressLoginHeaderLink: true, user: req.user });
  });

  app.post(
    '/login',
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login'
    })
  );

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });
}
