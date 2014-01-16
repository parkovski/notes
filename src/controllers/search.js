function SearchController(configure) {
}

SearchController.prototype.showSearchResults = function(req, res) {
  if (!req.query.q) {
    return res.redirect('/');
  }
  res.render('search.html', { title: 'Search', query: req.query.q });
};

module.exports = SearchController;
