const path = require('path');
const express = require('express');
const { projectStats } = require('./modules');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { query, user } = req;
    const userPath = path.resolve('submission', user);
    const stats = projectStats(userPath, query.id);
    return res.render('stats', { user: req.user, stats: stats });
  } catch (err) {
    console.log(err);
    if (err.code && (err.code === 404 || err.code.toUpperCase() === 'ENOENT')) {
      return res.status(404).render('404', { user: req.user });
    } else {
      return res.status(500).render('500', { user: req.user });
    }
  }
});

module.exports = {
  url: '/stats',
  route: router,
};
