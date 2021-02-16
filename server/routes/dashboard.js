const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { appSession = '' } = req.cookies;
    return res.render('dashboard', { pwd: appSession });
  } catch (err) {
    console.log(err);
    return res.status(500).json('Internal Server Error');
  }
});

module.exports = {
  url: '/',
  route: router,
};
