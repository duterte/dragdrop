const path = require('path');
const fs = require('fs-extra');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const {requireSecret} = require('./modules')
const router = express.Router();

router.get('/', requireSecret, (req, res) => {
    try {
      const name = req.query.name;
      // console.log(req.cookies)
      const uuid = uuidv4().split('-').join('');
      if (!fs.pathExistsSync(path.resolve('submission', uuid))) {
        if (!fs.pathExistsSync(path.resolve('submission'))) {
          fs.mkdirSync(path.resolve('submission'));
        }
        fs.mkdirSync(path.resolve('submission', uuid));
      }
      res.cookie('project_name', name, {
        httpOnly: true,
        secure: process.env.MODE === 'production' ? true : false,
        sameSite: 'Lax',
      });
      res.cookie('content_id', uuid, {
        httpOnly: true,
        secure: process.env.MODE === 'production' ? true : false,
        sameSite: 'Lax',
      });
      return res.redirect(`/project`);
      // throw new Error('Test Error');
    } catch (err) {
      console.log(err);
      return res.status(500).json('unexpected error occur in the server');
    }
  });

module.exports = {
    url: '/getproject',
    route: router
}