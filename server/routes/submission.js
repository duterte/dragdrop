const express = require('express');
const path = require('path');

const { projectStats, s3upload, requireSecret } = require('./modules');
const router = express.Router();

router.get('/', requireSecret, (req, res) => {
  try {
    const { cookies, headers } = req;
    const userPath = path.resolve('submission');
    const stats = projectStats(userPath, cookies.project_name);
    s3upload({
      files: stats.files,
      project_name: cookies.project_name,
    });
    res.render('submission');
    throw new Error('test error');
  } catch (err) {
    console.log(err);
    return res.status(500).json('unexpected error occur in the server');
  }
});

module.exports = {
  url: '/submission',
  route: router,
};
