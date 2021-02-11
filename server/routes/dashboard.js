const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    return res.render('dashboard', { user: req.user });
  } catch (err) {
    console.log(err);
    return res.status(500).json('Internal Server Error');
  }
});

module.exports = {
  url: '/',
  route: router,
};
