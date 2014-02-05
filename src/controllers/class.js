function ClassController(configure) {
  configure('*').setRenderVar('sections', ['Classes']);
}

ClassController.prototype.showClassPage = function(req, res) {
  res.render('class.html', {
    title: req.param('name')
  });
};

ClassController.prototype.showFollowingPage = function(req, res) {
  res.render('classes/following.html', {
    title: 'Following'
  });
};

ClassController.prototype.showCreatePage = function(req, res) {
  res.render('classes/new.html', {
    title: 'Create new'
  });
};

module.exports = ClassController;
