const express = require('express');
const router = express.Router();
const { requireSecret, sample } = require('./modules');

router.post('/', requireSecret, (req, res) => {
  try {
    // This is just a test
    return res.status(200).json(sample);
  } catch (err) {
    console.log(err);
    return res.status(500).json('unexpected error occur in the server');
  }
});

module.exports = {
  url: '/lists',
  route: router,
};
