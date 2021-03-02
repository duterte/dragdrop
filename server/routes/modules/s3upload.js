const fs = require('fs-extra');
const path = require('path');
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

  const writeStream = fs.createWriteStream(
    path.resolve(`s3_objects/${name}_${serverTime}.json`),
    { mode: 0o777 }
  );
  writeStream.write('[');
  files.forEach((file, i) => {
    const payload = {
      Bucket: destination,
      Key: `${serverTime}/${file}`.toLowerCase(),
      Body: fs.readFileSync(path.join('submission', project_name, file)),
    };
    const json = JSON.stringify({
      destination: payload.Bucket,
      objectKey: payload.Key,
    });
    writeStream.write(json);
    if (i !== files.length - 1) {
      writeStream.write(',');
    }
    s3.upload(payload, (err, data) => {
      if (err) {
        console.log(err);
        throw new Error('S3 error');
      }
    });
  });
  writeStream.write(']');
  writeStream.end();
};
