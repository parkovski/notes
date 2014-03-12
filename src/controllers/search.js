var async = require('async');
var log4js = require('log4js');

var searchModel = require('../models/search');

var logger = log4js.getLogger();

function SearchController(configure) {
}

SearchController.prototype.showSearchResults = function(req, res) {
  if (!req.query.q) {
    return res.render('search.html', {
      title: 'Search'
    });
  }
  var query = req.query.q;

  async.map([searchModel.searchClasses, searchModel.searchOrgs],
    function(item, cb) { item(query, cb); },
    function(err, results) {
      if (err) {
        logger.error(err);
      }
      res.render('search.html', {
        title: 'Search',
        query: query,
        classResults: results[0],
        orgResults: results[1],
        nothingFound: !(results[0].length || results[1].length)
      });
    }
  );
};

module.exports = SearchController;
