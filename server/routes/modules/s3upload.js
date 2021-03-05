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

  // writeStream.write('[');
  let json = { destination: undefined, s3ObjectKeys: [] };
  for (const file of files) {
    const payload = {
      Bucket: destination,
      Key: `${serverTime}/${file}`.toLowerCase(),
      Body: fs.readFileSync(path.join('submission', project_name, file)),
    };
    s3.upload(payload, (err, data) => {
      if (err) {
        console.log(err);
        throw new Error('S3 error');
      } else {
        console.log(data.Location);
      }
    });
    json['destination'] = payload.Bucket;
    json['s3ObjectKeys'] = [...json['s3ObjectKeys'], file.toLowerCase()];
  }

  const s3RecordsFolder = path.resolve('s3_objects', name);
  const s3RecordFile = path.resolve(s3RecordsFolder, `${serverTime}.json`);

  fs.ensureDirSync(s3RecordsFolder, 0o777);
  const stream = fs.createWriteStream(s3RecordFile, { mode: 0o777 });
  stream.write(JSON.stringify(json, null, 2));
  stream.end();
};
