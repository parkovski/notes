module.exports = function(app) {
  app.get('/', function (req, res) {
    res.render('index.html', { title: 'Home page', user: req.user });
  });
}
