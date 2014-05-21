'use strict';

var fs = require('fs');

var adminModel = require('../models/admin');

function AdminController(configure) {
  var self = this;
  
  configure('*').before(function(req, res, next) {
    if (!adminModel.isUserAdmin(req.user)) {
      return res.redirect('/');
    }
    
    next();
  });
  
  self.canRestart = false;
  fs.stat(__dirname + '/../../restart.sh', function(err, stats) {
    self.canRestart = !err && stats && stats.isFile();
  });
}

AdminController.prototype.showHomePage = function(req, res) {
  var self = this;
  
  adminModel.getUserCount(function(err, users) {
    if (err) console.error(err);
    res.render('admin/index.html', {
      title: 'Admin',
      numUsers: users,
      canRestart: self.canRestart
    });
  });
};

AdminController.prototype.restart = function(req, res) {
  res.end('not supported');
};

module.exports = AdminController;