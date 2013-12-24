function RouteConfiguration() {
  this.beforeList = [];
  this.afterList = [];
}

RouteConfiguration.prototype.before = function() {
  var self = this;
  [].slice.call(arguments).forEach(function(arg) { self.beforeList.push(arg); });
};

RouteConfiguration.prototype.after = function() {
  throw 'This will never be called.';
  var self = this;
  [].slice.call(arguments).forEach(function(arg) { self.afterList.push(arg); });
};

RouteConfiguration.prototype.requireLogin = function(req, res, next) {
  this.before(function(req, res, next) {
    if (!req.user) {
      return res.redirect('/login');
    }
    next();
  });
};

// -----

function Router(app) {
  this.app = app;
  this.controllers = {};
  this.config = {};
}

Router.prototype.getConfigFunctionFor = function(controllerName) {
  var config = this.config[controllerName] || (this.config[controllerName] = {});
  return function(methodName) {
    return config[methodName] || (config[methodName] = new RouteConfiguration());
  };
};

// Hacky form of inheritance whatever who cares.
// Pass a controller constructor.
Router.prototype.mixinController = function(controller) {
  controller.prototype.render = function(view, args) {
    args = args || {};
    args.user = this.req.user;
    this.res.render(view, args)
  }
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
    this.mixinController(ControllerClass);
    controller
      = this.controllers[controllerName]
      = new ControllerClass(
        this,
        this.getConfigFunctionFor(controllerName)
      );

    controller.req = null;
    controller.res = null;
  }

  var methodConfig = this.config[controllerName][methodName] || {};
  var allMethodConfig = this.config[controllerName]['*'] || {};

  var beforeAllList = allMethodConfig.beforeList || [];
  var afterAllList = allMethodConfig.afterList || [];

  var beforeList = methodConfig.beforeList || [];
  var afterList = methodConfig.afterList || [];

  var routeFunction = function(req, res) {
    controller.req = req;
    controller.res = res;
    controller[methodName](req, res);

    // If you use these inside closures you should copy them.
    // They're set to null here so you get errors instead of accidentally
    // using another request's variables.
    controller.req = null;
    controller.res = null;
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
