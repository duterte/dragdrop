const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    return res.render('dashboard', { user: req.data });
  } catch (err) {
    return res.status(500).send;
  }
});

module.exports = {
  url: '/',
  route: router,
};
