var orgModel = require('../models/org');
var async = require('async');
var log4js = require('log4js');

var logger = log4js.getLogger();

function OrgController(configure) {
}

OrgController.prototype.showOrgOverview = function(req, res) {
  var orgId = req.params.id;
  var getOrgName = function(callback) {
    orgModel.getName(req.params.id, callback);
  };
  var getClasses = function(callback) {
    orgModel.getClasses(req.params.id, callback);
  };
  async.map([getOrgName, getClasses],
    function(item, cb) { item(cb); },
    function(err, results) {
      if (err) {
        logger.error(err);
      }
      res.render('orgoverview.html', {
        title: results[0],
        sections: [{ name: 'Schools', url: '/org' }],
        classes: results[1]
      });
    }
  );
};

module.exports = OrgController;
