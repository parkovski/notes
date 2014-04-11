'use strict';

var async = require('async');

var classModel = require('../models/class');
var tokenModel = require('../models/token');

function ClassController(configure) {
  configure('*').setRenderVar('sections', [{
    name: 'Classes',
    url: '/classes/following'
  }]);
  configure('showFollowingPage').requireLogin();
  configure('showCreatePage').requireLogin();
  configure('createClass').requireLogin();
  configure('newPage').requireLogin();
  configure('subscribeUser').requireLogin();
  configure('unsubscribeUser').requireLogin();
}

ClassController.prototype.showClassPage = function(req, res) {
  var classId = req.params.id;
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
  var getClassPages = function(callback) {
    classModel.getClassPages(classId, callback);
  };
  async.map([getClassNameAndDesc, isSubscribed, getClassPages],
    function(item, cb) { item(cb); },
    function(err, results) {
      if (err) {
        console.error(err);
      }
      res.render('class.html', {
        title: results[0].name,
        jsmain: 'classdescription',
        description: results[0].description,
        id: classId,
        joined: results[1],
        pages: results[2]
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
        console.error(err);
      }
      return res.redirect('/c/' + classId);
    }
  );
};

ClassController.prototype.showEtherpad = function(req, res, next) {
  var docId = req.params.docId;
  
  async.parallel([
    function(callback) {
      tokenModel.putIfNotExists(
        req.user.id,
        'etherpadAuth',
        JSON.stringify({
          id: req.user.id,
          name: req.user.name,
          displayname: req.user.displayname
        }),
        1800, // half hour
        function(err, tokenId) {
          callback(err, tokenId);
        }
      );
    },
    function(callback) {
      classModel.getPage(docId, callback);
    },
  ],
  function(err, results) {
    if (err) {
      console.error(err);
    }
    var tokenId = results[0];
    var page = results[1];
    if (!page) {
      return next();
    }
    
    res.render('classes/etherpad.html', {
      padUrl: process.env.PAD_URL || 'http://pad.uanotes.com',
      noContentContainer: true,
      sections: [
        { name: 'Classes', url: '/classes/following' },
        { name: page.classname, url: '/c/' + page.classid }
      ],
      title: 'Edit',
      jsmain: 'padtitlebar',
      padName: page.name || 'Untitled',
      id: docId,
      authToken: tokenId
    });
  });
};

ClassController.prototype.newPage = function(req, res) {
  var classId = req.params.id;

  classModel.createPage(classId, function(err, pageId) {
    if (err) {
      console.error(err);
      return res.redirect('/c/' + classId);
    }
    res.redirect('/edit/' + pageId);
  });
};

ClassController.prototype.subscribeUser = function(req, res) {
  var classId = req.params.id;
  var userId = req.user.id;
  classModel.subscribe(classId, userId, function(err, success) {
    if (err) {
      console.error(err);
    }
    res.redirect('/c/' + classId);
  });
};

ClassController.prototype.unsubscribeUser = function(req, res) {
  var classId = req.params.id;
  var userId = req.user.id;
  classModel.unsubscribe(classId, userId, function(err, success) {
    if (err) {
      console.error(err);
    }
    res.redirect('/c/' + classId);
  });
};

module.exports = ClassController;
