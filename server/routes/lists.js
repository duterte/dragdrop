const path = require("path");
const express = require("express");
const { requireSecret } = require("./modules");
const projects = require(path.resolve("projects"));

const router = express.Router();

router.post("/", requireSecret, (req, res) => {
  try {
    return res
      .status(200)
      .json(
        req.projects
          .filter((item) => item.secret == req.secret)
          .map((item) => item.lessonNumber || item.projectName)
      );
  } catch (err) {
    console.log(err);
    return res.status(500).json("unexpected error occur in the server");
  }
});

module.exports = {
  url: "/lists",
  route: router,
};
