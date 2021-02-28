const fs = require('fs-extra');
const path = require('path');
const { S3, config } = require('aws-sdk');
const serverTime = require('./moment');
require('dotenv').config();

module.exports = (object) => {
  const { files, project_name, destination } = object;
  config.update({ region: 'ap-northeast-1' });
  const s3 = new S3({
    apiVersion: '2006-03-01',
    accessKeyId: process.env.S3_ACCESS,
    secretAccessKey: process.env.S3_SECRET,
  });
  files.forEach((file) => {
    const payload = {
      Bucket: process.env.S3_BUCKET,
      Key: `${serverTime}/${file}`.toLowerCase(),
      Body: fs.readFileSync(path.join('submission', project_name, file)),
    };
    s3.upload(payload, (err, data) => {
      if (err) {
        console.log(err);
        throw new Error('S3 error');
      }
      // console.log(data);
    });
  });
};
