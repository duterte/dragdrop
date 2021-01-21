const express = require('express');
const fileupload = require('express-fileupload');
const path = require('path');

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

app.post('/submitter/draganddrop', fileupload(option), (req, res) => {
  try {
    const { files } = req;
    // file validation
    const filesLen = files ? Object.keys(files).length : 0;
    if (!filesLen) {
      // send response Bad Request when there is no files is this ok ?
      console.log('request body has no files in it.');
      return res.status(400).json('request body has no files in it.');
    }

    // allowed extension : This is just a sample
    const validFiles = {};
    const EXT = ['jpg', 'jpeg', 'png', 'webp'];
    for (const i in files) {
      const fileName = files[i].name;
      const splitName = fileName.split('.');
      const fileExt = splitName[splitName.length - 1].toLowerCase();
      const found = EXT.find(extension => extension === fileExt);

      if (found) {
        validFiles[i] = {
          save: files[i].mv,
          url: path.join(__dirname, `/submission/${files[i].name}`),
          name: files[i].name,
        };
      } else {
        // trigger when there is unwanted files
        console.log('contain invalid files', i);
        return res.status(400).json('Invalid Files');
      }
    }

    // save files if validfiles lenght is not 0
    if (Object.keys(validFiles).length) {
      for (const i in validFiles) {
        validFiles[i].save(validFiles[i].url);
        console.log(`${validFiles[i].name} saved to ${validFiles[i].url}`);
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
