const path = require('path');
const fs = require('fs-extra');
const express = require('express');
const { projectStats, requireSecret } = require('./modules');
const router = express.Router();

router.get('/', requireSecret, (req, res) => {
  const name = req.query.name || req.cookies.project_name;
  try {
    const projectPath = path.resolve('submission', name);
    if (!fs.pathExistsSync(projectPath)) {
      const error = new Error('Content not found');
      error.code = 404;
      throw error;
    }
    const stats = projectStats(path.resolve('submission'), name);
    const project = req.projects.find(item => item.projectName === name);
    const buttons = {
      beta: project.allowBeta,
      live: project.allowProd,
    };
    return res.render('stats', { stats: stats, buttons: buttons, name: name });
  } catch (err) {
    console.log(err);
    if (err.code && (err.code === 404 || err.code.toUpperCase() === 'ENOENT')) {
      return res.status(404).render('404');
    } else {
      return res.status(500).render('500');
    }
  }
});

module.exports = {
  url: '/stats',
  route: router,
};
