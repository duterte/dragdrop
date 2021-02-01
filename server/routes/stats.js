const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
  const query = req.query.q;
  console.log(query);
  const resource = path.resolve(`submission/${query}.json`);
  // Bug here
  console.log('resource', resource);
  const stats = fs.readFileSync(resource);
  const statsJson = JSON.parse(stats);
  return res.render('stats', { data: 'Hello World', stats: statsJson });
});

module.exports = router;
