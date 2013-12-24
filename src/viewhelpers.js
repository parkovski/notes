var fs = require('fs');
var Handlebars = require('handlebars');

module.exports.setupAppForHandlebars = function setupAppForHandlebars(app) {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'handlebars');
  app.engine('html', require('consolidate').handlebars);
}

module.exports.registerPartials = function registerPartials() {
  fs.readdirSync(__dirname + '/views/partials/').forEach(function (viewName) {
    if (viewName.substr(viewName.length - 5) === '.html') {
      Handlebars.registerPartial(
        viewName.substr(0, viewName.length - 5),
        '' + fs.readFileSync(__dirname + '/views/partials/' + viewName)
      );
    }
  });
}
