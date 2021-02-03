const fs = require('fs');
const path = require('path');
const express = require('express');
const { requiresAuth } = require('express-openid-connect');
const router = express.Router();

router.get('/', requiresAuth(), (req, res) => {
  try {
    const query = req.query.id;
    const user = req.data.email;
    const resource = path.resolve(`submission/${user}/${query}.json`);
    const stats = fs.readFileSync(resource);
    const statsJson = JSON.parse(stats);
    return res.render('stats', { user: req.data, stats: statsJson });
  } catch (err) {
    console.log(err);
    if (err.code && err.code.toUpperCase() === 'ENOENT') {
      return res.status(404).render('404', { user: req.data });
    } else {
      return res.status(500).send();
    }
  }
});

module.exports = {
  url: '/stats',
  route: router,
};
