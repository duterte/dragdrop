const fs = require('fs');
const path = require('path');
const express = require('express');
const { requiresAuth } = require('express-openid-connect');
const chalk = require('chalk');
const AdmZip = require('adm-zip');
const analyzeZipFile = require('../modules/analyzeZipFile');
const router = express.Router();

function annalyzeDirectoryContent(userPath, id) {
  console.log(chalk.yellow('___START___'));
  const zip = new AdmZip();
  zip.addLocalFolder(path.resolve(userPath, id));
  zip.writeZip(path.resolve(userPath, `${id}.zip`));
  return analyzeZipFile(path.resolve(userPath, `${id}.zip`));
}

router.get('/', requiresAuth(), (req, res) => {
  try {
    const { query, user } = req;
    const userPath = path.resolve('submission', user.email);
    const stats = annalyzeDirectoryContent(userPath, query.id);
    const statsJson = JSON.parse(stats);
    return res.render('stats', { user: req.user, stats: statsJson });
  } catch (err) {
    if (err.code && (err.code === 404 || err.code.toUpperCase() === 'ENOENT')) {
      return res.status(404).render('404', { user: req.user });
    } else {
      console.log(err);
      return res.status(500).render('500', { user: req.user });
    }
  }
});

module.exports = {
  url: '/stats',
  route: router,
};
