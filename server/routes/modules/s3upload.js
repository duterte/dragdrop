const fs = require('fs-extra');
const path = require('path');
const { S3, config } = require('aws-sdk');
require('dotenv').config();

module.exports = object => {
  const { files, project_name } = object;
  config.update({ region: 'ap-northeast-1' });
  const s3 = new S3({
    apiVersion: '2006-03-01',
    accessKeyId: process.env.S3_ACCESS,
    secretAccessKey: process.env.S3_SECRET,
  });
  //
  const date = new Date();
  const parseDate = [
    date.getFullYear().toString().split('').slice(2).join(''),
    (date.getMonth() + 1).toString().padStart(2, '0'),
    date.getDate().toString().padStart(2, '0'),
  ].join('');
  //
  const dir = process.env.S3_DIR || 'websites';
  files.forEach(file => {
    const payload = {
      Bucket: process.env.S3_BUCKET,
      Key: `${dir}/${project_name}.${parseDate}/${file}`,
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
