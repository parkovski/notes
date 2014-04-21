'use strict';

var adminModel = require('../models/admin');

function AdminController(configure) {
  configure('*').before(function(req, res, next) {
    if (!adminModel.isUserAdmin(req.user)) {
      return res.redirect('/');
    }
    
    next();
  });
}

AdminController.prototype.showHomePage = function(req, res) {
  adminModel.getUserCount(function(err, users) {
    if (err) console.error(err);
    res.render('admin/index.html', {
      title: 'Admin',
      numUsers: users
    });
  });
};

module.exports = AdminController;