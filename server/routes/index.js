const upload = require('./upload');
const stats = require('./stats');
const dashboard = require('./dashboard');

console.log(__dirname);

module.exports = {
  upload: upload,
  stats: stats,
  dashboard: dashboard,
};
