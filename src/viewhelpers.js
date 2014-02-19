var fs = require('fs');
var Handlebars = require('handlebars');

module.exports.setupAppForHandlebars = function setupAppForHandlebars(app) {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'handlebars');
  app.engine('html', require('consolidate').handlebars);
};

module.exports.registerPartials = function registerPartials() {
  fs.readdirSync(__dirname + '/views/partials/').forEach(function (viewName) {
    if (viewName.substr(viewName.length - 5) === '.html') {
      Handlebars.registerPartial(
        viewName.substr(0, viewName.length - 5),
        '' + fs.readFileSync(__dirname + '/views/partials/' + viewName)
      );
    }
  });
};

var lessfiles = {};
var renderLess = function(name, res) {
  if (name in lessfiles) {
    res.end(lessfiles[name]);
  } else {
    var rendername = name;
    if (/theme.+\.less/.match(name)) {
      rendername = 'themebase.less';
      // TODO: fill in theme vars
    }
    fs.read(__dirname + '/../style/' + name, function(err, contents) {
      if (err) {
        lessfiles[name] = contents = '/* file read error */';
      }
      less.render(contents, function(err, css) {
        if (err) {
          lessfiles[name] = css = '/* less render error */';
        }
        res.end(css);
      });
    });
  }
};

module.exports.getStyleResponseFunction = function() {
  if (fs.existsSync(__dirname + '/../style/style0.css')) {
    return require('express').static(__dirname + '/../style');
  }
  var less = require('less');
  return function(req, res) {
    var name = req.url.substring(1).replace(/\.css$/, '.less');
    renderLess(name, res);
  };
};
