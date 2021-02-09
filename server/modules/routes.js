const path = require('path');
const ROUTES = require('../routes');

// this module is supposed to be close for modification
// please dont modify, route modules is totally reliant on this module
// modifying this will results on routes not working

function handler(express, app) {
  for (const key in ROUTES) {
    app.use(ROUTES[key].url, ROUTES[key].route);
  }
  app.use(express.static(path.resolve('public')));
}

module.exports = handler;
