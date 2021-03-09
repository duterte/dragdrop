const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { S3, config } = require('aws-sdk');
const serverTime = require('./moment');
require('dotenv').config();

module.exports = (object) => {
  const {
    files,
    project_name,
    destination,
    s3_access,
    s3_secret,
    name,
  } = object;

  config.update({ region: 'ap-northeast-1' });
  const s3 = new S3({
    apiVersion: '2006-03-01',
    accessKeyId: s3_access,
    secretAccessKey: s3_secret,
  });

  const s3RecordsFolder = path.resolve('s3_objects', name);
  const s3RecordFile = path.resolve(s3RecordsFolder, `${serverTime}.txt`);
  fs.ensureDirSync(s3RecordsFolder, 0o777);
  const stream = fs.createWriteStream(s3RecordFile, { mode: 0o777 });

  for (const file of files) {
    const filePath = path.join('submission', project_name, file);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.log(chalk.red('READ FILE ERROR'));
        console.log(err);
      } else {
        const payload = {
          Bucket: destination,
          Key: `${serverTime}/${file}`.toLowerCase(),
          Body: data,
        };
        s3.upload(payload, {}, (err, data) => {
          if (err) {
            console.log(chalk.red('S3 UPLOAD ERROR'));
            stream.write('S3 UPLOAD ERROR');
            stream.write('\n');
          } else {
            stream.write(data.Location);
            stream.write('\n');
          }
        });
      }
    });
  }
};
