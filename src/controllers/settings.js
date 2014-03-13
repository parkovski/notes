var userModel = require('../models/user');

function SettingsController(configure) {
  this.themes = require('../themes.json');
  configure('*').requireLogin();
}

SettingsController.prototype.showSettingsHomePage = function(req, res) {
  res.render('settings.html', {
    title: 'Settings',
    error: req.query.error
  });
};

SettingsController.prototype.update = function(req, res) {
  var fields = {};
  if (req.body.displayname) {
    fields.displayname = req.body.displayname;
  }
  // TODO: send validation email when email changed
  if (req.body.password) {
    if (req.body.confirmPassword === req.body.password) {
      fields.password = req.body.password;
    } else {
      return res.redirect('/settings?error=Passwords must match');
    }
  }

  userModel.changeFields(
    req.user.id,
    req.user.name,
    req.body.currentPassword,
    fields,
    function(err, passwordOk) {
      if (!err && passwordOk) {
        Object.keys(fields).forEach(function(field) {
          if (field === 'password') return;

          req.user[field] = fields[field];
        });
      }
      var error = passwordOk ? '' : '?error=Wrong password';
      res.redirect('/settings' + error);
    }
  );
};

SettingsController.prototype.showThemePicker = function(req, res) {
  res.render('themepicker.html', {
    title: 'Change theme',
    sections: [{ name: 'Settings', url: '/settings' }],
    themes: this.themes
  });
};

SettingsController.prototype.changeTheme = function(req, res) {
  if (!this.themes[req.body.themeid]) {
    return res.redirect('/settings');
  }
  userModel.changeFieldsWithoutPassword(
    req.user.id,
    req.user.name,
    { theme: req.body.themeid },
    function(err) {
      if (!err) {
        req.user.theme = req.body.themeid;
      }
      res.redirect('/settings');
    }
  );
};

module.exports = SettingsController;
