const path = require("path");
const fs = require("fs-extra");
const express = require("express");
const { projectStats, requireSecret, validateLesson } = require("./modules");
const router = express.Router();

router.get("/", requireSecret, (req, res) => {
  try {
    const { project_name: name, content_id: id, appSession = "" } = req.cookies;
    const type = req.query.type;
    if (type === "lesson") {
      // **
      const stats = validateLesson(path.resolve(`submission/${id}`), name);
      const countErrors = [
        ...stats.failed.lessonNumbers,
        ...stats.failed.time,
        ...stats.failed.mmss,
        ...stats.failed.version,
        ...stats.failed.missingFiles,
        ...stats.failed.invalidFileNames,
        ...stats.failed.invalidFileExtensions,
      ].length;

      console.log(...stats.messages.contents);

      const payload = {
        lessonNumber: name,
        audio: stats.messages.audio,
        contents: stats.messages.contents,
      };

      return res.status(200).render("lesson-stats", {
        pwd: appSession,
        payload,
        withErrors: Boolean(countErrors),
      });
      // **
    } else if (type === "website") {
      const projectPath = path.resolve("submission", id);
      if (!fs.pathExistsSync(projectPath)) {
        const error = new Error("Content not found");
        error.code = 404;
        throw error;
      }

      const stats = projectStats(path.resolve("submission"), id);
      const project = req.projects.find((item) => item.projectName === name);
      const buttons = {
        beta: project.allowBeta,
        live: project.allowProd,
      };
      return res.render("stats", {
        pwd: appSession,
        stats: stats,
        buttons: buttons,
        name: name,
      });
    } else {
      const error = new Error("Not Found");
      error.code = 404;
      throw error;
    }
  } catch (err) {
    console.log(err);
    const { appSession = "" } = req.cookies;
    if (err.code && (err.code === 404 || err.code.toUpperCase() === "ENOENT")) {
      return res.status(404).render("404", { pwd: appSession });
    } else {
      return res.status(500).render("500", { pwd: appSession });
    }
  }
});

module.exports = {
  url: "/stats",
  route: router,
};
