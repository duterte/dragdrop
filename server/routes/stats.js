const path = require('path');
const express = require('express');
const { projectStats } = require('./modules');
const router = express.Router();

router.get('/', (req, res) => {
  const name = req.query.name;
  try {
    const userPath = path.resolve('submission');
    const stats = projectStats(userPath, name);
    return res.render('stats', { stats: stats });
  } catch (err) {
    console.log(err);
    if (err.code && (err.code === 404 || err.code.toUpperCase() === 'ENOENT')) {
      return res.status(404).render('404', { user });
    } else {
      return res.status(500).render('500', { user });
    }
  }
});

module.exports = {
  url: '/stats',
  route: router,
};
