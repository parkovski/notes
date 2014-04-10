'use strict';

var orgModel = require('../../models/org');

function AjaxOrgController(configure) {
  configure('setDescription').failOnNoAuth();
}

AjaxOrgController.prototype.setDescription = function(req, res) {
  orgModel.setDescription(req.params.id, req.body.description, function(err) {
    res.end(err);
  });
};

module.exports = AjaxOrgController;
