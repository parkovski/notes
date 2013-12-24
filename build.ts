// Brute force build system. Find all files that need to be built
// and run their compilers.

// /// <reference path="typings/DefinitelyTyped/node/node.d.ts"/>

// gotta migrate this to js...
declare var require: any;
declare var __dirname: any;
declare var process: any;

var fs = require('fs');
var child_process = require('child_process');

declare module 'open' {
  // not correct, but all that we need here.
  function open(name: string);
  export = open;
}

import open = require('open');

var hadError = false;

var onfinishlist: Function[] = [];
var finish_target = 1;
var finish_total = 0;

function onfinish(cb?: Function) {
  if (cb) {
    onfinishlist.push(cb);
  } else {
    onfinishlist.forEach((finishCb) => {
      finishCb();
    });
  }
}

function finish() {
  ++finish_total;
  if (finish_total === finish_target) {
    onfinish();
  }
}

var fileExtMappings = {
  '.ts': '.js',
  '.less': '.css'
};

var commands = {
  '.ts': 'tsc $in -m commonjs',
  '.less': 'lessc $in $out'
};

var excludeNames = [
  '.git',
  'node_modules',
  'typings',
  'style/themebase.less'
].map((name) => {
  return __dirname + '/' + name;
});

var optionsMap = {
  '-r': 'run',
  '-s': 'start'
};

var options = ((optionsMap) => {
  var options = {};
  Object.keys(optionsMap).forEach((key) => {
    options[optionsMap[key]] = false;
  });
  return options;
})(optionsMap);

var target = 'build';

process.argv.slice(2).forEach(arg => {
  if (arg[0] === '-') {
    // TODO: any options here.
    if (arg in optionsMap) {
      options[optionsMap[arg]] = true;
    }
  } else {
    target = arg;
  }
});

var targets = {
  'build': () => collectFiles().forEach(compile),
  'themes': buildThemes,
  'clean': () => collectFiles().forEach(removeOutput),
  'start': () => {
    options['run'] = true;
    options['start'] = true;
  }
};

onfinish(bailOnError);
onfinish(processOptions);
if (!(target in targets)) {
  console.log('no target ' + target + '. stopping.');
  process.exit();
} else {
  targets[target]();
  finish();
}

function bailOnError() {
  if (hadError) {
    process.exit();
  }
}

function processOptions() {
  options['run'] |= options['start'];
  if (options['run']) {
    console.log('starting main.js');
    child_process.fork(__dirname + '/main.js');
  }
  if (options['start']) {
    open('http://localhost:4000');
  }
}

function removeOutput(file: string) {
  var ext = file.substr(file.lastIndexOf('.'));
  var output = file.substr(0, file.length - ext.length) + fileExtMappings[ext];

  try {
    fs.unlinkSync(output);
  } catch (e) {
  } finally {
    finish();
  }
}

function compile(file: string) {
  var ext = file.substr(file.lastIndexOf('.'));
  if (!(ext in commands)) {
    throw 'missing extension ' + ext;
  }

  var output = file.substr(0, file.length - ext.length) + fileExtMappings[ext];

  // If output is newer than input, don't build.
  var inputTime = fs.statSync(file).mtime;
  var outputTime = inputTime;
  try {
    outputTime = fs.statSync(output).mtime;
  } catch (e) {
  }

  if (outputTime > inputTime) {
    finish();
    return;
  }

  var shortInput = file.substring(__dirname.length + 1);
  var shortOutput = output.substring(__dirname.length + 1);

  console.log('building ' + shortInput + ' > ' + shortOutput);

  var command = commands[ext]
    .replace(/\$in/, file)
    .replace(/\$out/, output);

  child_process.exec(command, (error, stdout, stderr) => {
    if (error) {
      hadError = true;
    }

    if (stdout.length) {
      console.log(stdout.toString());
    }
    if (stderr.length) {
      hadError = true;
      console.log(stderr.toString());
    }
    finish();
  });
}

function collectFiles(): string[] {
  var files: string[] = [];

  var getEnumerator = (dir: string) => {
    return (shortFilename: string) => {
      var filename = dir + '/' + shortFilename;
      if (~excludeNames.indexOf(filename)) {
        return;
      }

      var ext = filename.substr(filename.lastIndexOf('.'));
      if (fs.statSync(filename).isDirectory()) {
        fs.readdirSync(filename).forEach(getEnumerator(filename));
      } else if (ext in fileExtMappings) {
        files.push(filename);
      }
    };
  };

  fs.readdirSync(__dirname).forEach(getEnumerator(__dirname));

  // Add 1 for the general building target, otherwise we never run onfinish
  // when we haven't collected any files.
  finish_target = files.length + 1;
  return files;
}

function compileTheme(themebase: string, out: string, overrides: any) {
  var shortInput = themebase.substring(__dirname.length + 1);
  var shortOutput = out.substring(__dirname.length + 1);

  console.log('building theme', shortInput, '>', shortOutput);

  var command = 'lessc ';
  Object.keys(overrides).forEach((v) => {
    command += '--modify-var="' + v + '=' + overrides[v] + '" ';
  });

  command += themebase + ' ' + out;

  child_process.exec(command, (error, stdout, stderr) => {
    if (error) {
      hadError = true;
    }

    if (stdout.length) {
      console.log(stdout.toString());
    }
    if (stderr.length) {
      hadError = true;
      console.log(stderr.toString());
    }
    finish();
  });
}

function buildThemes() {
  var themes = require('./src/themes.json');
  var themebase = __dirname + '/style/themebase.less';

  finish_target = 1;
  Object.keys(themes).forEach((theme) => {
    ++finish_target;
    compileTheme(
      themebase,
      __dirname + '/style/theme' + theme + '.css',
      themes[theme]
    );
  });
}
