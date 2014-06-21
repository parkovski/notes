'use strict';

var userModel = require('../models/user');

function FourOhFourController(configure) {
  //this.sendToUserPage = configure.getRouteFunction('user#showUserPage');
}

FourOhFourController.prototype.show404Page = function(req, res) {
  var username = req.path.split('/')[1];
  var self = this;
  var render = function(isUser) {
    if (isUser) {
      //return self.sendToUserPage(req, res);
      res.render('404.html', { title: username + '\'s page' });
    } else {
      res.render('404.html', { title: 'Not found :(' });
    }
  };
  
  if (!username) return render(false);
  
  userModel.isUser(username, render);
};

module.exports = FourOhFourController;
