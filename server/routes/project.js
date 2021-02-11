const express = require('express');
const path = require('path');
const fileupload = require('express-fileupload');
const fs = require('fs-extra');
const AdmZip = require('adm-zip');
const dirTree = require('directory-tree');
const { projectStats, s3upload, requireSecret, sample } = require('./modules');

const router = express.Router();
require('dotenv').config();

function getType(array, filter) {
  return array.filter(item => item.type.toLowerCase() === filter);
}

function parsefileSize(number) {
  const bytes = [
    { type: 'GB', number: Math.round(number / 1000000000) },
    { type: 'MB', number: Math.round(number / 1000000) },
    { type: 'KB', number: Math.round(number / 1000) },
    { type: 'Bytes', number: number },
  ];
  let str = undefined;
  for (const item of bytes) {
    if (item.number !== 0) {
      str = `${item.number} ${item.type}`;
      break;
    }
  }
  return str ? str : 0;
}

router.get('/', requireSecret, (req, res) => {
  try {
    // secret
    const user = req.user;
    const { name, dirname } = req.query;
    let dir = undefined;
    let breadcrumb = [
      {
        name: 'root',
        href: `/project?name=${name}`,
      },
    ];

    if (dirname) {
      dir = path.resolve(`submission/${name}/${dirname}`);
      const paths = dirname.split('/');
      breadcrumb = [
        ...breadcrumb,
        ...paths.map((item, i, n) => {
          return {
            name: item,
            href: `/project?name=${name}&dirname=${n.slice(0, i + 1)}`,
          };
        }),
      ];
    } else {
      dir = path.resolve(`submission/${name}`);
    }

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
      let link = undefined;
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
        link = `/project?name=${name}&dirname=${dirname}`;
      }
      const data = {
        name: entry.name,
        partial,
        size: parsefileSize(entry.size),
        link: link,
      };
      dirStructure.push(data);
    }

    return res
      .cookie('project_name', name, {
        path: '/project',
        httpOnly: true,
        secure: process.env.MODE === 'production' ? true : false,
        sameSite: true,
      })
      .render('project', {
        breadcrumb,
        dirStructure,
        user: req.user,
        name,
      });
  } catch (err) {
    console.log(err);
    if (err.code && (err.code === 404 || err.code.toUpperCase() === 'ENOENT')) {
      return res.status(404).render('404', { user: req.user });
    } else {
      return res.status(500).render('500', { user: req.user });
    }
  }
});

const fileUploadOption = {
  createParentPath: true,
  safeFileNames: true,
  preserveExtension: true,
};

router.post(
  '/',
  requireSecret,
  fileupload(fileUploadOption),
  async (req, res) => {
    try {
      const { query, files /* , user */ } = req;
      const { name, dirname = '' } = query;
      if (!fs.pathExistsSync(path.resolve('submission', name))) {
        const error = new Error('project did not exist');
        error.code = 400;
        throw error;
      }

      const projectPath = path.resolve('submission', name, dirname);
      for (const item in files) {
        const extension = files[item].name
          .split('.')
          .reduceRight(i => i)
          .toLowerCase();
        if (extension === 'zip') {
          const zip = new AdmZip(files[item].data);
          zip.extractAllTo(projectPath, true);
        } else {
          await files[item].mv(path.join(projectPath, files[item].name));
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

router.get('/get', requireSecret, (req, res) => {
  try {
    const name = req.query.name;
    // const userPath = path.resolve('submission', user);
    if (!fs.pathExistsSync(path.resolve('submission', name))) {
      if (!fs.pathExistsSync(path.resolve('submission'))) {
        fs.mkdirSync(path.resolve('submission'));
      }

      fs.mkdirSync(path.resolve('submission', name));
      return res.redirect(`/project?name=${name}`);
    } else {
      return res.redirect(`/project?name=${name}`);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json('unexpected error occur in the server');
  }
});

router.get('/download', requireSecret, (req, res) => {
  try {
    const { cookies, user } = req;
    const name = cookies.project_name;
    const zip = new AdmZip();
    zip.addLocalFolder(path.resolve('submission', name));
    zip.writeZip(path.resolve('submission', `${name}.zip`));
    console.log(name);
    res.setHeader('Content-disposition', `attachment; filename=${name}.zip`);
    res.setHeader('Content-type', 'application/x-zip-compressed');
    res.download(path.resolve('submission', `${name}.zip`));
  } catch (err) {
    console.log(err);
    return res.status(500).json('unexpected error occur in the server');
  }
});

function targetPath(query) {
  return query.dirname
    ? path.resolve('submission', query.name, query.dirname)
    : path.resolve('submission', query.name);
}

router.post('/folder', requireSecret, (req, res) => {
  try {
    const { query, body } = req;
    const projectPath = targetPath(query);
    fs.mkdirSync(path.join(projectPath, body.folderName));
    return res.status(200).send();
  } catch (err) {
    console.log(err);
    return res.status(500).json('unexpected error occur in the server');
  }
});

router.post('/deletefiles', requireSecret, (req, res) => {
  try {
    const { query, body, user } = req;
    const projectPath = targetPath(query);
    if (body.lists) {
      for (const item of body.lists) {
        const a = path.join(projectPath, item).trim();
        fs.removeSync(a);
      }
    }
    return res.status(200).send();
  } catch (err) {
    console.log(err);
    return res.status(500).json('unexpected error occur in the server');
  }
});

router.post('/submission', requireSecret, (req, res) => {
  try {
    const { cookies } = req;
    const userPath = path.resolve('submission');
    const stats = projectStats(userPath, cookies.project_name);
    for (const key in stats.errors) {
      if (key.length) {
        return res.redirect(`/stats?name=${cookies.project_name}`);
      }
    }
    s3upload({
      files: stats.files,
      project_name: cookies.project_name,
    });
    return res.status(200).json();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json('unexpected error occur in the server');
  }
});

module.exports = {
  url: '/project',
  route: router,
};
