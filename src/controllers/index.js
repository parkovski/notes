'use strict';

function IndexController(configure) {
}

IndexController.prototype.showHomePage = function(req, res) {
  res.render('index.html', {
    title: 'Home page'
  });
};

module.exports = IndexController;
