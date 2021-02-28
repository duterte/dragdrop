const express = require('express');
const path = require('path');
const fs = require('fs-extra');

const { projectStats, s3upload, requireSecret } = require('./modules');
const router = express.Router();

router.get('/live', requireSecret, (req, res) => {
  try {
    const { project_name: name, content_id: id, appSession = '' } = req.cookies;
    const live = req.projects.find((item) => item.projectName === name)
      .allowProd;
    if (!live) {
      return res.render('submission', {
        status: 'Failed',
        message: `Can't Upload Content`,
      });
    }
    const projectPath = path.resolve('submission', id);
    if (!fs.pathExistsSync(projectPath)) {
      const error = new Error('Content not found');
      error.code = 404;
      throw error;
    }
    const { files2, errors } = projectStats(path.resolve('submission'), id);
    for (const item in errors) {
      if (errors[item].length) {
        return res.redirect('/stats');
      }
    }

    const destination = req.projects.find((item) => item.projectName === name)
      .destination;
    s3upload({ files: files2, project_name: id, destination });
    return res.render('submission', {
      pwd: appSession,
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
    const { project_name: name, content_id: id, appSession } = req.cookies;
    const beta = req.projects.find((item) => item.projectName === name)
      .allowBeta;
    if (!beta) {
      return res.render('submission', {
        status: 'Failed',
        message: `Can't Upload Content`,
      });
    }
    const projectPath = path.resolve('submission', id);
    if (!fs.pathExistsSync(projectPath)) {
      const error = new Error('Content not found');
      error.code = 404;
      throw error;
    }
    const { files2, errors } = projectStats(path.resolve('submission'), id);
    for (const item in errors) {
      if (errors[item].length) {
        return res.redirect('/stats');
      }
    }
    const destination = req.projects.find((item) => item.projectName === name)
      .destination;
    s3upload({ files: files2, project_name: id, destination });
    return res.render('submission', {
      pwd: appSession,
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
