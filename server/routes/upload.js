const path = require('path');
const fs = require('fs-extra');
const express = require('express');
const fileupload = require('express-fileupload');
const { v4: uuid } = require('uuid');
const { requiresAuth } = require('express-openid-connect');
const analyzeZipFile = require('../modules/analyzeZipFile');
const router = express.Router();

const fileUploadOption = {
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: path.resolve('temp'),
  safeFileNames: true,
  preserveExtension: true,
};

router.get('/', requiresAuth(), (req, res) => {
  res.render('upload', { user: req.data });
});

router.post(
  '/',
  requiresAuth(),
  fileupload(fileUploadOption),
  async (req, res) => {
    try {
      const { files } = req;
      const filesLen = files ? Object.keys(files).length : 0;
      if (!filesLen) {
        console.log('request body has no files in it.');
        return res.status(400).json('request body has no files in it.');
      }

      const user = req.data.email;
      const fileName = files['file1'].name;
      const id = uuid().split('-').join('');
      const split = fileName.split('.');
      const ext = split[split.length - 1].toLowerCase();
      const savePath = path.resolve(`submission/${user}/${id}.${ext}`);
      const jsonFileName = path.resolve(`submission/${user}/${id}.json`);
      if (ext !== 'zip') {
        const error = new Error('File not valid');
        error.code = 400;
        throw error;
      } else {
        await files['file1'].mv(savePath);
        const stats = analyzeZipFile(savePath);
        const report = fs.createWriteStream(jsonFileName);
        report.write(stats);
        return res.redirect(302, `/stats?id=${id}`);
      }
    } catch (err) {
      console.log(err);
      if (err && err.code === 400) {
        return res.status(400).json('Bad request');
      } else {
        return res.status(500).json('Testing Error');
      }
    }
  }
);

module.exports = {
  url: '/upload',
  route: router,
};
