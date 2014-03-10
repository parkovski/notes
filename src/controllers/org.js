var orgModel = require('../models/org');
var async = require('async');
var log4js = require('log4js');

var logger = log4js.getLogger();

function OrgController(configure) {
  configure('joinUserToOrg').requireLogin();
  configure('unjoinUserFromOrg').requireLogin();
}

OrgController.prototype.showOrgOverview = function(req, res) {
  var orgId = req.params.id;
  var getOrgName = function(callback) {
    orgModel.getName(orgId, callback);
  };
  var getClasses = function(callback) {
    orgModel.getClasses(orgId, callback);
  };
  var isJoined = function(callback) {
    if (!req.user) {
      callback(null, false);
    } else {
      orgModel.isUserJoined(orgId, req.user.id, callback);
    }
  };
  async.map([getOrgName, getClasses, isJoined],
    function(item, cb) { item(cb); },
    function(err, results) {
      if (err) {
        logger.error(err);
      }
      res.render('orgoverview.html', {
        title: results[0],
        id: orgId,
        sections: [{ name: 'Schools', url: '/org' }],
        classes: results[1],
        joined: results[2]
      });
    }
  );
};

OrgController.prototype.joinUserToOrg = function(req, res) {
  var orgId = req.params.id;
  var userId = req.user.id;
  orgModel.joinUser(orgId, userId, function(err, success) {
    if (err) {
      logger.error(err);
    }
    res.redirect('/org/' + orgId + '/?changed');
  });
};

OrgController.prototype.unjoinUserFromOrg = function(req, res) {
  var orgId = req.params.id;
  var userId = req.user.id;
  orgModel.unjoinUser(orgId, userId, function(err, success) {
    if (err) {
      logger.error(err);
    }
    res.redirect('/org/' + orgId + '/?changed');
  });
};

module.exports = OrgController;
