var tokenModel = require('../../models/token');
var hat = require('hat');

function AjaxTokenController(configure) {
}

AjaxTokenController.prototype.get = function(req, res) {
  tokenModel.get(req.params.token, function(err, data) {
    if (err) {
      console.error(err);
      return res.end();
    }
    res.end(data);
  });
};

module.exports = AjaxTokenController;