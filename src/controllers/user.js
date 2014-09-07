'use strict';

function UserController(configure) {
}

UserController.prototype.showUserPage = function(req, res, next) {
  var username = req.path.split('/')[1];
  res.render('user/index.html', { title: 'My page' });
};

module.exports = UserController;
