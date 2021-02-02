const path = require('path');
const fs = require('fs');
const express = require('express');
const fileupload = require('express-fileupload');
const { requiresAuth } = require('express-openid-connect');
const { analyzeZip } = require('../modules');

const router = express.Router();

const fileUploadOption = {
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: path.resolve('temp'),
  safeFileNames: true,
  preserveExtension: true,
};

router.get('/', requiresAuth(), (req, res) => {
  res.render('upload');
});

router.post('/', requiresAuth(), fileupload(fileUploadOption), (req, res) => {
  try {
    const { files } = req;
    // file validation
    const filesLen = files ? Object.keys(files).length : 0;
    if (!filesLen) {
      console.log('request body has no files in it.');
      return res.status(400).json('request body has no files in it.');
    }
    const validFiles = {};
    for (const i in files) {
      const split = files[i].name.split('.');
      const name = split[0];
      const ext = split[split.length - 1];
      validFiles[i] = {
        save: files[i].mv,
        // url: path.join(__dirname, `/submission/${name}.${ext}`),
        url: path.resolve(`submission/${name}.${ext}`),
        name: files[i].name,
        data: files[i].data,
      };
    }
    let statsID = undefined;
    if (Object.keys(validFiles).length) {
      for (const i in validFiles) {
        validFiles[i].save(validFiles[i].url);
        statsID = analyzeZip(validFiles[i].url);
      }
    }
    console.log('test sucessful');
    return res.redirect(`/stats?q=${statsID}`);
  } catch (err) {
    console.log(err);
    return res.status(500).json('Testing Error');
  }
});

module.exports = {
  url: '/upload',
  route: router,
};

// module.exports = router;
