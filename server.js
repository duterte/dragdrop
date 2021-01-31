const path = require('path');
const express = require('express');
const fileupload = require('express-fileupload');
const { v4: uuidv4 } = require('uuid');

const extractZipFile = require('./zip');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  return res.sendFile(path.resolve('public/index.html'));
});

app.use('/', express.static(path.resolve('public')));

const option = {
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: path.join(__dirname, 'tmp'),
  safeFileNames: true,
  preserveExtension: true,
};

app.post('/upload', fileupload(option), (req, res) => {
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
      const uid = uuidv4().split('-').join('');
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

    return res.status(202).json('Testing Successful');
  } catch (err) {
    console.log(err);
    return res.status(500).json('Testing Error');
  }
});

app.listen(PORT, () => console.log('server is started'));
