'use strict';

var async = require('async');
var log4js = require('log4js');

var orgModel = require('../models/org');
var classModel = require('../models/class');
var adminModel = require('../models/admin');

var logger = log4js.getLogger();

function GlobalController(configure) {
}

GlobalController.prototype.loadGlobalVars = function(req, res, next) {
  if (!req.user) {
    return next();
  }

  var userId = req.user.id;

  async.map([orgModel.getUserOrgs, classModel.getUserClasses],
    function(item, cb) { item(userId, cb); },
    function(err, results) {
      if (err) {
        logger.error(err);
      }
      res.setRenderVar('orgMembership', results[0]);
      res.setRenderVar('classMembership', results[1]);
      res.setRenderVar('isAdmin', adminModel.isUserAdmin(req.user));
      next();
    }
  );
}

module.exports = GlobalController;
