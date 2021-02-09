const { S3, config } = require('aws-sdk');
require('dotenv').config();

module.exports = object => {
  // object.user can be replaced with the name of the website
  // that user is working with.
  const { files, user, projectId } = object;
  config.update({ region: 'ap-northeast-1' });
  const s3 = new S3({
    apiVersion: '2006-03-01',
    accessKeyId: process.env.S3_ACCESS,
    secretAccessKey: process.env.S3_SECRET,
  });
  const date = new Date();
  const parseDate = [
    date.getFullYear().toString().split('').slice(2).join(''),
    (date.getMonth() + 1).toString().padStart(2, '0'),
    date.getDate().toString().padStart(2, '0'),
  ].join('');

  files.forEach(file => {
    const payload = {
      Bucket: process.env.S3_BUCKET,
      // ${user} can be replaced with the name of the website
      // that user is working with.
      Key: `websites/${user}/${parseDate}/${file}`,
      Body: fs.readFileSync(path.join('submission', user, projectId, file)),
    };
    s3.upload(payload, (err, data) => {
      if (err) {
        console.log(err);
        throw new Error('S3 error');
      } else {
        console.log(data);
      }
    });
  });
};
