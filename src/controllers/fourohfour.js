'use strict';

function FourOhFourController(configure) {
}

FourOhFourController.prototype.show404Page = function(req, res) {
  res.render('404.html', { title: 'Not found :(' });
};

module.exports = FourOhFourController;
