function IndexController() {
}

IndexController.prototype.showHomePage = function(req, res) {
  this.render('index.html', {
    title: 'Home page'
  });
};

module.exports = IndexController;
