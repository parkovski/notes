var _ = require('underscore');

function RouteConfiguration() {
  this.beforeList = [];
  this.afterList = [];
}

RouteConfiguration.prototype.before = function() {
  var self = this;
  [].forEach.call(arguments, function(arg) { self.beforeList.push(arg); });
};

RouteConfiguration.prototype.after = function() {
  throw 'This will never be called.';
  var self = this;
  [].forEach.call(arguments, function(arg) { self.afterList.push(arg); });
};

RouteConfiguration.prototype.requireLogin = function() {
  this.before(function(req, res, next) {
    if (!req.user) {
      return res.redirect('/login?r=' + encodeURIComponent(req.originalUrl));
    }
    next();
  });
};

RouteConfiguration.prototype.setRenderVar = function(name, value) {
  this.before(function(req, res, next) {
    res.setRenderVar(name, value);
    next();
  });
};

// -----

function upgradeReqAndRes(app) {
  app.use(function(req, res, next) {
    var renderVars = { user: req.user };

    var originalRender = res.render;
    res.render = function(view, locals, callback) {
      if (typeof locals === 'function') {
        callback = locals;
        locals = renderVars;
      } else if (locals) {
        _.extend(locals, renderVars);
      } else {
        locals = renderVars;
      }

      originalRender.call(res, view, locals, callback);
    };

    res.setRenderVar = function(name, value) {
      renderVars[name] = value;
    };

    res.getRenderVar = function(name) {
      return renderVars[name];
    };

    res.deleteRenderVar = function(name) {
      delete renderVars[name];
    };

    next();
  });
}

function Router(app) {
  this.app = app;
  this.controllers = {};
  this.config = {};
  this._lastResort = null;

  upgradeReqAndRes(app);
}

Router.prototype.getConfigFunctionFor = function(controllerName) {
  var config = this.config[controllerName] || (this.config[controllerName] = {});
  return function(methodName) {
    return config[methodName] || (config[methodName] = new RouteConfiguration());
  };
};

// Route path specifies a controller and method.
// This method may return an array of methods, if the controller configured
// before and after for the specified route.
Router.prototype.getRouterFor = function(routePath) {
  var parts = routePath.split('/');
  if (parts.length !== 2) {
    throw new Error('invalid route path ' + routePath);
  }
  var controllerName = parts[0];
  var methodName = parts[1];

  var controller = this.controllers[controllerName];
  if (!controller) {
    var ControllerClass = require('./controllers/' + controllerName);
    controller
      = this.controllers[controllerName]
      = new ControllerClass(this.getConfigFunctionFor(controllerName));
  }

  var methodConfig = this.config[controllerName][methodName] || {};
  var allMethodConfig = this.config[controllerName]['*'] || {};

  var beforeAllList = allMethodConfig.beforeList || [];
  var afterAllList = allMethodConfig.afterList || [];

  var beforeList = methodConfig.beforeList || [];
  var afterList = methodConfig.afterList || [];

  var routeFunction = function(req, res, next) {
    controller[methodName](req, res, next);
  };

  var allResponseFunctions = [];

  beforeAllList.forEach(function(fn) { allResponseFunctions.push(fn); });
  beforeList.forEach(function(fn) { allResponseFunctions.push(fn); });

  allResponseFunctions.push(routeFunction);

  afterList.forEach(function(fn) { allResponseFunctions.push(fn); });
  afterAllList.forEach(function(fn) { allResponseFunctions.push(fn); });

  if (allResponseFunctions.length === 1) {
    return allResponseFunctions[0];
  }

  return allResponseFunctions;
};

Router.prototype.handleSpecialRoute = function(routeName, controllerPath) {
  if (routeName === '404') {
    this._lastResort = this.getRouterFor(controllerPath);
    return true;
  }

  return false;
};

Router.prototype.addLastResort = function() {
  if (this._lastResort) {
    this.app.use(this._lastResort);
  }
};

// routes object:
// {
//  '/': 'index/showHomePage',
//  '/login': 'login/showLoginPage',
//  'post /login': 'login/login'
// }
// default verb is get.
Router.prototype.configureRoutes = function(routes) {
  var self = this;
  Object.keys(routes).forEach(function(key) {
    if (self.handleSpecialRoute(key, routes[key])) {
      return;
    }
    var spacePos = key.indexOf(' ');
    var verb = 'get';
    var path = key;
    if (~spacePos) {
      verb = key.substring(0, spacePos);
      path = key.substring(spacePos + 1);
    }

    if (!~['get', 'post', 'all'].indexOf(verb)) {
      throw new Error('invalid verb ' + verb);
    }

    self.app[verb](path, self.getRouterFor(routes[key]));
  });

  this.config = null;
};

module.exports = Router;
