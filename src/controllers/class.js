function ClassController(configure) {
  configure('*').setRenderVar('sections', [{
    name: 'Classes',
    url: '/classes/following'
  }]);
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

ClassController.prototype.showEtherpad = function(req, res) {
  var docId = req.params.docId;

  res.render('classes/etherpad.html', {
    noContentContainer: true,
    sections: [
      { name: 'Classes', url: '/classes/following' },
      { name: docId, url: '/c/' + docId }
    ],
    title: 'Edit',
    id: docId
  });
};

module.exports = ClassController;
