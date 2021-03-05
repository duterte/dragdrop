const express = require('express');
const path = require('path');
const fs = require('fs-extra');

const { projectStats, s3upload, requireSecret } = require('./modules');
const router = express.Router();

function submit(req, res) {
  try {
    const { project_name: name, content_id: id, appSession } = req.cookies;
    const project = req.projects.find((item) => item.projectName === name);
    const projectPath = path.resolve('submission', id);
    const { files2, errors } = projectStats(path.resolve('submission'), id);

    const {
      allowBeta,
      destination,
      s3_access,
      s3_secret,
      allowProd,
      exception,
    } = project;

    if (req.url === '/beta' && !allowBeta) {
      return res.render('submission', {
        status: 'Failed',
        message: `Can't Upload Content`,
      });
    }

    if (req.url === '/live' && !allowProd) {
      return res.render('submission', {
        status: 'Failed',
        message: `Can't Upload Content`,
      });
    }

    if (!fs.pathExistsSync(projectPath)) {
      const error = new Error('Content not found');
      error.code = 404;
      throw error;
    }

    if (!exception) {
      for (const item in errors) {
        if (errors[item].length) {
          return res.redirect('/stats');
        }
      }
    }

    s3upload({
      files: files2,
      project_name: id,
      name: name,
      destination,
      s3_access,
      s3_secret,
    });
    return res.render('submission', {
      pwd: appSession,
      status: 'Successful',
      message: 'Upload Successful',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json('unexpected error occur in the server');
  }
}

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

router.get('/beta', requireSecret, submit);

module.exports = {
  url: '/submission',
  route: router,
};
