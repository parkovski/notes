var fs = require('fs');
var Handlebars = require('handlebars');
var less = require('less');

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

var _csscache = {};
var _themevars = (function() {
  // The less compiler translates --modify-var to a piece of code and tacks it
  // on to the file, so we'll do the same thing.
  var themevars = require('./themes.json');
  var themecode = {};
  Object.keys(themevars).forEach(function(theme) {
    var code = '';
    Object.keys(themevars[theme]).forEach(function(v) {
      code += '\n@' + v + ': ' + themevars[theme][v] + ';';
    });
    themecode[theme] = code;
  });
  return themecode;
})();
var renderLess = function(name, res) {
  var rendername;
  var themeid = null;
  var match = /theme(.+)\.css$/.exec(name);
  if (match) {
    rendername = __dirname + '/../style/themebase.less';
    themeid = match[1];
  } else {
    rendername = __dirname + '/../style/' + name.replace(/\.css$/, '.less');
  }
  fs.readFile(rendername, function(err, contents) {
    if (err) {
      res.writeHeader(404);
      res.end();
      return;
    }
    contents = '' + contents;
    if (themeid !== null) {
      contents += _themevars[themeid];
    }
    less.render(contents, function(err, css) {
      if (err) {
        console.log('*** less render error');
        console.log(err);
        css = '/* less render error */';
      }
      _csscache[name] = css;
      res.end(css);
    });
  });
};

// When we're asked for style/x.css, do these things:
// 1) If x.css is cached, serve that.
// 2) If x.css exists on disk, cache and serve it.
// 3) If x is theme[n].css, compile themebase.less for the appropriate theme;
//    cache and serve that.
// 4) If x.less exists on disk, compile, cache and serve it.
// 5) 404.
module.exports.getStyleResponseFunction = function() {
  // hacky check to see if themes were compiled or not. probably remove this.
  if (fs.existsSync(__dirname + '/../style/style0.css')) {
    return require('express').static(__dirname + '/../style');
  }

  return function(req, res) {
    var cssname = req.url.substring(1);
    var diskFileName = __dirname + '/../style/' + cssname;
    res.setHeader('Content-Type', 'text/css');
    if (_csscache.hasOwnProperty(cssname)) {
      return res.end(_csscache[cssname]);
    }
    fs.readFile(diskFileName, function(err, contents) {
      if (err) {
        return renderLess(cssname, res);
      }
      res.end(_csscache[cssname] = contents);
    });
  };
};
