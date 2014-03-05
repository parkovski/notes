var log4js = require('log4js');

var orgModel = require('../models/org');

var logger = log4js.getLogger();

function ClassController(configure) {
  configure('*').setRenderVar('sections', [{
    name: 'Classes',
    url: '/classes/following'
  }]);
  configure('showFollowingPage').requireLogin();
  configure('showCreatePage').requireLogin();
  configure('createClass').requireLogin();
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

ClassController.prototype.createClass = function(req, res) {
  orgModel.createClass(req.body.orgId,
    req.body.name,
    null, 
    function(err, classId) {
      if (err) {
        logger.error(err);
      }
      return res.redirect('/c/' + classId);
    }
  );
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
