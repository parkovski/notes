'use strict';

var fs = require('fs');
var child_process = require('child_process');
var path = require('path');

var adminModel = require('../models/admin');

function AdminController(configure) {
  var self = this;
  
  configure('*').before(function(req, res, next) {
    if (!adminModel.isUserAdmin(req.user)) {
      return res.redirect('/');
    }
    
    next();
  });
}

AdminController.prototype.showHomePage = function(req, res) {
  var self = this;
  
  var time = Math.floor(process.uptime());
  var uptime = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: time
  };
  uptime.seconds = time % 60; time = Math.floor(time / 60);
  uptime.minutes = time % 60; time = Math.floor(time / 60);
  uptime.hours = time % 24; time = Math.floor(time / 24);
  uptime.days = time;
  
  adminModel.getUserCount(function(err, users) {
    if (err) console.error(err);
    res.render('admin/index.html', {
      title: 'Admin',
      numUsers: users,
      uptime: uptime
    });
  });
};

AdminController.prototype.gitPull = function(req, res) {
  var gitCwd = path.normalize(__dirname + '/../..');
  child_process.exec('git pull', { cwd: gitCwd }, function(err, stdout, stderr) {
    if (err) console.error(err);
    res.render('admin/output.html', {
      title: 'Git pull',
      sections: [{ name: 'Admin', url: '/admin' }],
      stdout: stdout,
      stderr: stderr
    });
  });
};

AdminController.prototype.crash = function(req, res) {
  res.render('admin/output.html', {
    title: 'Crash',
    sections: [{ name: 'Admin', url: '/admin' }],
    stdout: 'Wait a minute, then go back to admin. Hope you didn\'t break anything.',
    stderr: 'Good luck!'
  });
  
  setTimeout(process.exit, 150);
};

module.exports = AdminController;