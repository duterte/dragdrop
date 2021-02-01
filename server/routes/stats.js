const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
  const stats = fs.readFileSync(path.resolve('stats.json'));
  // console.log(stats);
  const statsJson = JSON.parse(stats);
  return res.render('stats', { data: 'Hello World', stats: statsJson });
});

module.exports = router;
