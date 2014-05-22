'use strict';

function HelpController(configure) {
}

HelpController.prototype.showAboutPage = function(req, res) {
  res.render('help/about.html', { title: 'About' });
};

HelpController.prototype.showFeedbackPage = function(req, res) {
  res.render('help/feedback.html', { title: 'Feedback' });
};

HelpController.prototype.showContributePage = function(req, res) {
  res.render('help/contribute.html', { title: 'Contribute' });
};

module.exports = HelpController;
