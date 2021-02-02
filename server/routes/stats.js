const fs = require('fs');
const path = require('path');
const express = require('express');
const { requiresAuth } = require('express-openid-connect');
const router = express.Router();

router.get('/', requiresAuth(), (req, res) => {
  try {
    const query = req.query.q;
    console.log(query);
    const resource = path.resolve(`submission/${query}.json`);
    // Bug here
    console.log('resource', resource);
    const stats = fs.readFileSync(resource);
    const statsJson = JSON.parse(stats);
    return res.render('stats', { data: 'Hello World', stats: statsJson });
  } catch (err) {
    // console.log(err.code);
    if (err.code && err.code.toUpperCase() === 'ENOENT') {
      return res.status(404).render('403');
    } else {
      return res.status(500).send();
    }
  }
});

module.exports = {
  url: '/stats',
  route: router,
};

// module.exports = router;
