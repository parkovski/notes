var fs = require('fs');
var Handlebars = require('handlebars');

var controllerFiles = [
  'index',
  'login'
];

function loadRoutes(app) {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'handlebars');
  app.engine('html', require('consolidate').handlebars);
  controllerFiles.forEach(function (file) {
    require(__dirname + '/controllers/' + file)(app);
  });

  fs.readdirSync(__dirname + '/views/partials/').forEach(function (viewName) {
    if (viewName.substr(viewName.length - 5) === '.html') {
      Handlebars.registerPartial(
        viewName.substr(0, viewName.length - 5),
        '' + fs.readFileSync(__dirname + '/views/partials/' + viewName)
      );
    }
  });
}


module.exports = loadRoutes;

