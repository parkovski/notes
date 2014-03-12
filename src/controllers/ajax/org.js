var orgModel = require('../../models/org');

function AjaxOrgController(configure) {
}

AjaxOrgController.prototype.setDescription = function(req, res) {
  orgModel.setDescription(req.params.id, req.body.description, function(err) {
    res.end(err);
  });
};

module.exports = AjaxOrgController;
