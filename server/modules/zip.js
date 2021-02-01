const path = require('path');
const fs = require('fs-extra');
const AdmZip = require('adm-zip');
const $ = require('cheerio');
const { v4: uuid } = require('uuid');

const allowedDirectory = [
  'assets',
  'css',
  'fonts',
  'images',
  'img',
  'js',
  'video',
];

function analyzeZip(filename) {
  console.log(filename);
  const zip = new AdmZip(path.resolve(filename));
  const zipEntries = zip.getEntries(); //

  // error reports lists

  const stats = {
    errors: {
      hierarchyLevelViolation: [],
      filesInWrongDirectory: [],
      notAllowedDirectory: [],
      unSupportedTypeOfFiles: [],
      notFoundFiles: [],
    },
    passed: {
      'index.html': false,
      filesInRightDirectory: [],
    },
    referencedUrls: {
      absoluteUrls: [],
      relativeUrls: [],
    },
    files: [],
    totalNumberOfFiles: 0,
  };

  zipEntries.forEach(entry => {
    const info = {
      isDirectory: entry.isDirectory,
      entryName: entry.entryName.toLowerCase(),
      name: entry.name.toLowerCase(),
      nameExt: (() => {
        const name = entry.name.split('.');
        let ext = undefined;
        if (name.length > 1) {
          ext = name[name.length - 1].toLowerCase();
        }
        return ext;
      })(),
    };
    // console.log(info);
    const dirPath = info.entryName.split('/');
    if (info.isDirectory) {
      if (dirPath.length - 1 > 1) {
        stats.errors.hierarchyLevelViolation.push(info.entryName);
      } else if (!allowedDirectory.find(entry => entry === dirPath[0])) {
        stats.errors.notAllowedDirectory.push(info.entryName);
      }
    } else {
      if (info.entryName === 'index.html') {
        stats.passed['index.html'] = true;
        // reading index.html
        const html = zip.readAsText(entry);

        // scrapping content in index.html;
        const scrapSrc = $('[src]', html);
        const scrapHref = $('[href]', html);
        const relativeUrls = [];
        const absoluteUrls = [];
        const absoluteUrlPattern = /https?/i;
        for (let i = 0; i < scrapSrc.length; i++) {
          const src = scrapSrc[i].attribs.src;
          if (src.search(absoluteUrlPattern) === 0) {
            absoluteUrls.push(src);
          } else {
            relativeUrls.push(src);
          }
        }
        for (let i = 0; i < scrapHref.length; i++) {
          const href = scrapHref[i].attribs.href;
          if (href[0] !== '#') {
            if (href.search(absoluteUrlPattern) === 0) {
              absoluteUrls.push(href);
            } else {
              relativeUrls.push(href);
            }
          }
        }
        stats.referencedUrls.absoluteUrls = absoluteUrls;
        stats.referencedUrls.relativeUrls = relativeUrls;
      } else if (info.nameExt) {
        // file hierarchy validation
        const directory = info.entryName.split('/')[0];
        let possibleDirectory = [];

        if (/js/i.test(info.nameExt)) {
          possibleDirectory = ['js'];
        } else if (/css/i.test(info.nameExt)) {
          possibleDirectory = ['css'];
        } else if (/png|jpe?g|gif|pdf|webp/i.test(info.nameExt)) {
          possibleDirectory = ['images', 'img', 'assets'];
        } else if (
          /mp4|mov|wmv|avi|avchd|f(l|4)v|swf|mkv|webm/i.test(info.nameExt)
        ) {
          possibleDirectory = ['video', 'assets'];
        }
        const found = possibleDirectory.find(entry => entry === directory);
        if (possibleDirectory.length && !found) {
          stats.errors.filesInWrongDirectory.push(info.entryName);
        } else if (!found) {
          stats.errors.unSupportedTypeOfFiles.push(info.entryName);
        } else if (dirPath.length - 1 > 1) {
          stats.errors.filesInWrongDirectory.push(info.entryName);
        } else {
          stats.passed.filesInRightDirectory.push(info.entryName);
        }
      }
      stats.files.push(info.entryName);
      stats.totalNumberOfFiles++;
    }
  });
  const relativeUrls = stats.referencedUrls.relativeUrls;

  for (let i = 0; i < relativeUrls.length; i++) {
    if (
      !stats.files.find(
        file => file.toLowerCase() === relativeUrls[i].toLowerCase()
      )
    ) {
      stats.errors.notFoundFiles.push(relativeUrls[i]);
    }
  }
  const json = JSON.stringify(stats, null, 2);
  const statsID = uuid();
  const jsonFileName = path.resolve(`submission/${statsID}.json`);
  const report = fs.createWriteStream(jsonFileName, {
    encoding: 'utf8',
  });
  // reporting stats
  report.write(json);
  console.log(jsonFileName);
  return statsID;
  // The next step will be here.

  // We will never actually unzip and write files unto our disk
  // we will instead upload all files directly to S3
  // if there is no errors

  // parsing Date

  // const date = new Date();
  // const year = date.getFullYear();
  // const month = date.getMonth() + 1;
  // const day = date.getDay() + 1;
  // const stringDate = `${year}/${month}/${day}`;

  //
  // fs.remove(path.resolve(filename), err => {
  //   if (err) console.log(err);
  //   console.log('done');
  // });
}

module.exports = analyzeZip;
