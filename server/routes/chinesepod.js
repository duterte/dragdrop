const express = require("express");
// const { requireSecret } = require("./modules");
const router = express.Router();

router.get("/submit", (req, res) => {
  try {
    return res.render("lesson-asset");
  } catch (err) {
    return res.status(500).render("500", { pwd: appSession });
  }
});

module.exports = {
  url: "/chinesepod",
  route: router,
};
