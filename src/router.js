'use strict';

var _ = require('underscore');

function RouteConfiguration() {
  this.beforeList = [];
  this.afterList = [];
}

RouteConfiguration.prototype.before = function() {
  var self = this;
  [].forEach.call(arguments, function(arg) { self.beforeList.push(arg); });
};

// 'after' functions will only be called if the main route handler calls next().
// This is probably not the right behavior, but it's not worth the work to
// change it right now.
RouteConfiguration.prototype.after = function() {
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

RouteConfiguration.prototype.failOnNoAuth = function() {
  this.before(function(req, res, next) {
    if (!req.user) {
      return res.end('no authentication');
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
      } else if (locals) {
        _.extend(renderVars, locals);
      }

      originalRender.call(res, view, renderVars, callback);
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
  this.routerFunctions = {};
  this._lastResort = null;

  upgradeReqAndRes(app);
}

Router.prototype.getConfigFunctionFor = function(controllerName) {
  var self = this;
  var config = this.config[controllerName] || (this.config[controllerName] = {});
  var func = function(methodName) {
    return config[methodName] || (config[methodName] = new RouteConfiguration());
  };
  func.getRouteFunction = function(routePath) {
    return self.getRouterFor(routePath);
  };
  return func;
};

// Route path specifies a controller and method.
Router.prototype.getRouterFor = function(routePath) {
  if (this.routerFunctions[routePath]) return this.routerFunctions[routePath];
  
  var parts = routePath.split('#');
  if (parts.length !== 2) {
    throw new Error('invalid route path ' + routePath);
  }
  var controllerName = parts[0].replace('.', '/');
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
    return this.routerFunctions[routePath] = allResponseFunctions[0];
  }

  return this.routerFunctions[routePath] = function(req, res, next) {
    var i = 0;
    var last = allResponseFunctions.length - 1;
    var callNextHandler = function() {
      if (++i === last) {
        return allResponseFunctions[i](req, res, next);
      }
      return allResponseFunctions[i](req, res, callNextHandler);
    };
    
    allResponseFunctions[0](req, res, callNextHandler);
  };
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

function getModifiersAndRoute(routeStr) {
  var mods = [];
  var info = {
    regex: false,
    verb: 'get',
    route: null
  };

  while (true) {
    var spacePos = routeStr.indexOf(' ');
    if (~spacePos) {
      mods.push(routeStr.substring(0, spacePos));
      routeStr = routeStr.substring(spacePos + 1);
    } else {
      break;
    }
  }

  mods.forEach(function(mod) {
    if (mod === 'regex') {
      info.regex = true;
    } else if (~['get', 'post', 'all'].indexOf(mod)) {
      info.verb = mod;
    } else {
      throw new Error('invalid route modifier: ' + mod);
    }
  });

  info.route = routeStr;

  return info;
}

// routes object:
// {
//  '/': 'index#showHomePage',
//  '/login': 'login#showLoginPage',
//  'post /login': 'login#login',
//  '/ajax/user/:id': 'ajax.user#getInfo'
// }
// default verb is get.
Router.prototype.configureRoutes = function(routes) {
  var self = this;
  Object.keys(routes).forEach(function(key) {
    if (self.handleSpecialRoute(key, routes[key])) {
      return;
    }
    var info = getModifiersAndRoute(key);
    var path = info.route;
    if (info.regex) path = new RegExp(path);

    var router = self.getRouterFor(routes[key]);
    var addRouter = function(r) {
      self.app[info.verb](path, r);
    };
    if (Array.isArray(router)) {
      router.forEach(addRouter);
    } else {
      addRouter(router);
    }
  });

  this.addLastResort();

  this.config = null;
};

module.exports = Router;
