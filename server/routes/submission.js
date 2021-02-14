const express = require('express');
const path = require('path');
const fs = require('fs-extra');

const { projectStats, s3upload, requireSecret } = require('./modules');
const router = express.Router();

router.get('/live', requireSecret, (req, res) => {
  try {
    const name = req.query.name || req.cookies.project_name;
    const live = req.projects.find(item => item.projectName === name).allowProd;
    if (!live) {
      return res.render('submission', {
        status: 'Failed',
        message: `Can't Upload Content`,
      });
    }
    const projectPath = path.resolve('submission', name);
    if (!fs.pathExistsSync(projectPath)) {
      const error = new Error('Content not found');
      error.code = 404;
      throw error;
    }
    const stats = projectStats(projectPath);
    for (const item in stats.errors) {
      if (item.length) {
        return res.redirect('/stats');
      }
    }

    s3upload({ files: stats.files, project_name: name });
    return res.render('submission', {
      status: 'Successful',
      message: 'Upload Successful',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json('unexpected error occur in the server');
  }
});

router.get('/beta', requireSecret, (req, res) => {
  try {
    const name = req.query.name || req.cookies.project_name;

    const beta = req.projects.find(item => item.projectName === name).allowBeta;
    if (!beta) {
      return res.render('submission', {
        status: 'Failed',
        message: `Can't Upload Content`,
      });
    }
    const projectPath = path.resolve('submission', name);
    if (!fs.pathExistsSync(projectPath)) {
      const error = new Error('Content not found');
      error.code = 404;
      throw error;
    }
    const stats = projectStats(projectPath);
    for (const item in stats.errors) {
      if (item.length) {
        return res.redirect('/stats');
      }
    }

    s3upload({ files: stats.files, project_name: name });
    return res.render('submission', {
      status: 'Successful',
      message: 'Upload Successful',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json('unexpected error occur in the server');
  }
});

module.exports = {
  url: '/submission',
  route: router,
};
