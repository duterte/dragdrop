const express = require('express');
const path = require('path');
const fileupload = require('express-fileupload');
const fs = require('fs-extra');
const AdmZip = require('adm-zip');
const dirTree = require('directory-tree');
const { requireSecret } = require('./modules');

const router = express.Router();
require('dotenv').config();

function getType(array, filter) {
  return array.filter((item) => item.type.toLowerCase() === filter);
}

function parsefileSize(size = 0) {
  class DigitalStorage {
    constructor() {
      this.bytes = { type: 'bytes', calc: size };
      this.KB = { type: 'KB', calc: this.bytes.calc / 1024 };
      this.MB = { type: 'MB', calc: this.KB.calc / 1024 };
      this.GB = { type: 'GB', calc: this.MB.calc / 1024 };
    }

    storage() {
      const array = [this.bytes, this.KB, this.MB, this.GB];
      const sort = array.sort((a, b) => a.calc - b.calc);
      const reduce = sort.reduce((acc, curr) => {
        if (curr.calc > -1 && curr.calc < 1000) {
          return curr;
        } else {
          return acc;
        }
      });
      const result = reduce.calc.toFixed(2) + ' ' + reduce.type;
      return result;
    }
  }
  const digital = new DigitalStorage();
  return digital.storage();
}

router.get('/', requireSecret, (req, res) => {
  try {
    // const name = req.cookies.content_id;
    const { content_id: name, project_name } = req.cookies;
    const dir = path.resolve(`submission/${name}`);
    const tree = dirTree(dir, { normalizePath: true });
    if (!tree) {
      const error = new Error('Directory not found');
      error.code = 404;
      throw error;
    }
    const { children } = tree;
    const typeDir = getType(children, 'directory');
    const typeFile = getType(children, 'file');
    const dirStructure = [];
    for (const entry of [...typeDir, ...typeFile]) {
      let partial = undefined;
      if (entry.type === 'file') {
        if (/html?/i.test(entry.extension)) {
          partial = 'html-file';
        } else if (/js/i.test(entry.extension)) {
          partial = 'js-file';
        } else if (/css/i.test(entry.extension)) {
          partial = 'css-file';
        } else if (/png|jpe?g|gif|pdf|webp/i.test(entry.extension)) {
          partial = 'image-file';
        } else if (
          /mp4|mov|wmv|avi|avchd|f(l|4)v|swf|mkv|webm/i.test(entry.extension)
        ) {
          partial = 'video-file';
        } else {
          partial = 'text-file';
        }
      } else {
        const regex = new RegExp(`${name}\/(\.*)`);
        const dirname = entry.path.match(regex)[1];
        partial = 'folder';
      }
      const data = {
        name: entry.name,
        partial,
        size: parsefileSize(entry.size),
      };
      dirStructure.push(data);
    }

    const find = req.projects
      .filter((item) => {
        return item.secret == req.secret;
      })
      .find((item) => {
        if (item.projectName === project_name) {
          return item;
        } else if (item.lessonNumber === Number(project_name)) {
          return item;
        }
      });

    const type = Object.hasOwnProperty.call(find, 'lessonNumber')
      ? 'lesson'
      : 'website';

    return res.render('project', {
      dirStructure,
      pwd: req.cookies.appSession || '',
      type: type,
    });
  } catch (err) {
    console.log(err);
    const { appSession = '' } = req.cookies;
    if (err.code && (err.code === 404 || err.code.toUpperCase() === 'ENOENT')) {
      return res.status(404).render('404', { pwd: appSession });
    } else {
      return res.status(500).render('500', { pwd: appSession });
    }
  }
});

const fileUploadOption = {
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: path.resolve('temp'),
  preserveExtension: true,
};

router.post(
  '/',
  requireSecret,
  fileupload(fileUploadOption),
  async (req, res) => {
    try {
      const files = req.files;
      const name = req.cookies.content_id;
      if (!fs.pathExistsSync(path.resolve('submission', name))) {
        const error = new Error('project did not exist');
        error.code = 400;
        throw error;
      }
      const projectPath = path.resolve('submission', name);
      for (const item in files) {
        const extension = files[item].name
          .split('.')
          .reduceRight((i) => i)
          .toLowerCase();
        console.log(files[item].name, 'uploaded');
        if (extension === 'zip') {
          const zipDirPath = path.resolve('zip');
          const zipName = name + '.zip';
          const zipFilePath = path.join(zipDirPath, zipName);
          fs.ensureDirSync(zipDirPath);
          await files[item].mv(zipFilePath);
          const zip = new AdmZip(zipFilePath);
          zip.extractAllTo(projectPath, true);
        } else {
          const fileName = files[item].name.toLowerCase();
          await files[item].mv(path.join(projectPath, fileName));
        }
      }

      return res.status(200).json('Done');
    } catch (err) {
      console.log(err);
      if (err.code && err.code === 400) {
        return res.status(400).json('Bad Request');
      } else {
        return res.status(500).json('unexpected error occur in the server');
      }
    }
  }
);

module.exports = {
  url: '/project',
  route: router,
};
