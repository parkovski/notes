var classModel = require('../../models/class');

function AjaxClassController(configure) {
  configure('setPageName').failOnNoAuth();
  configure('setDescription').failOnNoAuth();
}

AjaxClassController.prototype.setPageName = function(req, res) {
  classModel.setPageName(req.params.id, req.body.name, function(err) {
    res.end(err);
  });
};

AjaxClassController.prototype.setDescription = function(req, res) {
  classModel.setDescription(req.params.id, req.body.description, function(err) {
    res.end(err);
  });
};

module.exports = AjaxClassController;
