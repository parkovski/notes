function HelpController(configure) {
}

HelpController.prototype.showAboutPage = function(req, res) {
  res.render('about.html', { title: 'About' });
};

HelpController.prototype.showFeedbackPage = function(req, res) {
  res.render('feedback.html', { title: 'Feedback' });
};

HelpController.prototype.showContributePage = function(req, res) {
  res.render('contribute.html', { title: 'Contribute' });
};

HelpController.prototype.showHelpPage = function(req, res) {
  res.render('help.html', { title: 'Help' });
};

module.exports = HelpController;