const express = require('express');
const path = require('path');
const fs = require('fs-extra');

const { projectStats, s3upload, requireSecret } = require('./modules');
const router = express.Router();

router.get('/', requireSecret, (req, res) => {
  try {
    const name = req.query.name || req.cookies.project_name;
    if (!fs.pathExistsSync(path.resolve('submission', name))) {
      const error = new Error('Content not found');
      error.code = 404;
      throw error;
    }
    const stats = projectStats(
      path.resolve('submission'),
      cookies.project_name
    );
    // console.log(stats);
    for (const item in stats.errors) {
      if (item.length) {
        return res.redirect('/stats');
      }
    }

    s3upload({
      files: stats.files,
      project_name: cookies.project_name,
    });
    return res.render('submission');
  } catch (err) {
    console.log(err);
    return res.status(500).json('unexpected error occur in the server');
  }
});

module.exports = {
  url: '/submission',
  route: router,
};
