var async = require('async');
var log4js = require('log4js');

var classModel = require('../models/class');

var logger = log4js.getLogger();

function ClassController(configure) {
  configure('*').setRenderVar('sections', [{
    name: 'Classes',
    url: '/classes/following'
  }]);
  configure('showFollowingPage').requireLogin();
  configure('showCreatePage').requireLogin();
  configure('createClass').requireLogin();
  configure('subscribeUser').requireLogin();
  configure('unsubscribeUser').requireLogin();
}

ClassController.prototype.showClassPage = function(req, res) {
  var classId = req.params.id;
  var membershipChanged = 'changed' in req.query;
  var getClassNameAndDesc = function(callback) {
    classModel.getNameAndDescription(classId, callback);
  };
  var isSubscribed = function(callback) {
    if (!req.user) {
      callback(null, false);
    } else {
      classModel.isUserSubscribed(classId, req.user.id, callback);
    }
  };
  async.map([getClassNameAndDesc, isSubscribed],
    function(item, cb) { item(cb); },
    function(err, results) {
      if (err) {
        logger.error(err);
      }
      res.render('class.html', {
        title: results[0].name,
        description: results[0].description,
        id: classId,
        joined: results[1],
        membershipChanged: membershipChanged
      });
    }
  );
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
  classModel.create(req.body.orgId,
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
    padUrl: process.env.PAD_URL || 'http://pad.uanotes.com',
    noContentContainer: true,
    sections: [
      { name: 'Classes', url: '/classes/following' },
      { name: docId, url: '/c/' + docId }
    ],
    title: 'Edit',
    id: docId
  });
};

ClassController.prototype.subscribeUser = function(req, res) {
  var classId = req.params.id;
  var userId = req.user.id;
  classModel.subscribe(classId, userId, function(err, success) {
    if (err) {
      logger.error(err);
    }
    res.redirect('/c/' + classId + '/?changed');
  });
};

ClassController.prototype.unsubscribeUser = function(req, res) {
  var classId = req.params.id;
  var userId = req.user.id;
  classModel.unsubscribe(classId, userId, function(err, success) {
    if (err) {
      logger.error(err);
    }
    res.redirect('/c/' + classId + '/?changed');
  });
};

module.exports = ClassController;
