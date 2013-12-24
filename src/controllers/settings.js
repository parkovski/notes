var userModel = require('../models/user');

function SettingsController(app, configure) {
  this.themes = require('../themes.json');
  configure('*').requireLogin();
}

SettingsController.prototype.showThemePicker = function(req, res) {
  this.render('themepicker.html', { title: 'Pick a theme', themes: this.themes });
};

SettingsController.prototype.changeTheme = function(req, res) {
  if (!this.themes[req.body.themeid]) {
    return res.redirect('/settings');
  }
  userModel.changeFields(
    req.user.id,
    { theme: req.body.themeid },
    function(err) {
      if (!err) {
        req.user.theme = req.body.themeid;
      }
      console.log(err);
      res.redirect('/settings');
    }
  );
};

module.exports = SettingsController;
