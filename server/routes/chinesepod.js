const path = require("path");
const express = require("express");
const { validateLesson } = require("./modules");
const router = express.Router();

router.get("/submit", (req, res) => {
  try {
    return res.render("lesson-asset");
  } catch (err) {
    return res.status(500).render("500", { pwd: appSession });
  }
});

router.post("/stats", (req, res) => {
  console.log("request received", req.baseUrl);
  try {
    // const { project_name: name, content_id: id, appSession = "" } = req.cookies;
    // const stats = validateLesson(path.resolve(`submission/${id}`), name);
    // console.log(stats);
    return res.status(200).json({ test: "hello world" /* success: true */ });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

module.exports = {
  url: "/chinesepod",
  route: router,
};
