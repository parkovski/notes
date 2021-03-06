'use strict';

var fs = require('fs');
var less = require('less');

module.exports.setupAppForSwig = function setupAppForSwig(app) {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'swig');
  app.engine('html', require('consolidate').swig);
};

var _writeCss = function(where) {
  return function(err, css) {
    if (err) {
      console.log(err);
      return;
    }
    fs.writeFile(where, css);
  };
};

// Blocking apis allowed - see compileLessFiles.
var compileThemes = function(themebase, styleDir) {
  console.log('compiling all themes from ', themebase);
  var themevars = (function() {
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

  themebase = '' + fs.readFileSync(themebase);

  Object.keys(themevars).forEach(function(theme) {
    less.render(themebase + themevars[theme],
      _writeCss(styleDir + 'theme' + theme + '.css'));
  });
};

// Blocking apis allowed - see compileLessFiles.
var compileLess = function(lessFile, cssFile) {
  console.log('compiling ', lessFile);
  less.render('' + fs.readFileSync(lessFile), _writeCss(cssFile));
};

// This is called once on startup so we are allowed to use blocking apis.
module.exports.compileLessFiles = function compileLessFiles() {
  var styleDir = __dirname + '/../style/';
  var cssDir = styleDir + 'css/';
  fs.readdirSync(styleDir).forEach(function(file) {
    if (!/\.less$/.test(file)) return;
    var fullLess = styleDir + file;
    var css = file.replace(/\.less$/, '.css');
    var isThemebase = false;
    if (file === 'themebase.less') {
      // check one to see if they should be recompiled.
      css = 'theme0.css';
      isThemebase = true;
    }
    var fullCss = cssDir + css;
    var lessTime = fs.statSync(fullLess).mtime;
    var cssTime = fs.existsSync(fullCss)
      ? fs.statSync(fullCss).mtime
      : 0;

    if (isThemebase && lessTime <= cssTime) {
      // maybe we didn't change themebase but we did change
      // the themes definition file.
      lessTime = fs.statSync(__dirname + '/themes.json').mtime;
    }

    if (lessTime > cssTime) {
      if (isThemebase) {
        compileThemes(fullLess, cssDir);
      } else {
        compileLess(fullLess, fullCss);
      }
    }
  });
};
