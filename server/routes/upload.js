const path = require('path');
const fs = require('fs');
const express = require('express');
const fileupload = require('express-fileupload');
const extractZipFile = require('../zip');

const router = express.Router();

const fileUploadOption = {
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: path.join(__dirname, 'tmp'),
  safeFileNames: true,
  preserveExtension: true,
};

router.get('/', (req, res) => {
  res.render('upload');
});

router.post('/', fileupload(fileUploadOption), (req, res) => {
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
        url: path.join(__dirname, `/submission/${name}.${ext}`),
        name: files[i].name,
        data: files[i].data,
      };
    }

    if (Object.keys(validFiles).length) {
      for (const i in validFiles) {
        validFiles[i].save(validFiles[i].url);
        console.log(`${validFiles[i].name} saved to ${validFiles[i].url}`);
        extractZipFile(validFiles[i].url);
      }
    }
    console.log('test sucessful');
    return res.redirect(301, '/stats');
    // const stats = fs.readFile(
    //   path.resolve('stats.json'),
    //   { encoding: 'utf8' },
    //   (err, data) => {
    //     if (err) {
    //       console.log('error');
    //       throw new Error();
    //     } else {
    //       return res.contentType('.html').render('stats', {
    //         data: 'Hello World',
    //         stats: JSON.parse(data),
    //       });
    //     }
    //   }
    // );
  } catch (err) {
    console.log(err);
    return res.status(500).json('Testing Error');
  }
});

module.exports = router;
