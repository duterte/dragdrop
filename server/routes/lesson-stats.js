const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  try {
    const { project_name: name, content_id: id, appSession = "" } = req.cookies;
    return res.render("lesson-stats", { pwd: appSession });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

module.exports = {
  url: "/lessonstats",
  route: router,
};
