const path = require("path");
const AdmZip = require("adm-zip");
const $ = require("cheerio");

const allowedDirectory = [
  "assets",
  "css",
  "fonts",
  "images",
  "img",
  "js",
  "video",
];

module.exports = function (userPath, name) {
  const stats = {
    errors: {
      hierarchyLevelViolation: [],
      filesInWrongDirectory: [],
      notAllowedDirectory: [],
      unSupportedTypeOfFiles: [],
      notFoundFiles: [],
    },
    passed: {
      "index.html": false,
      filesInRightDirectory: [],
    },
    referencedUrls: {
      absoluteUrls: [],
      relativeUrls: [],
    },
    files: [],
    totalNumberOfFiles: 0,
  };

  const zip = new AdmZip();
  zip.addLocalFolder(path.resolve(userPath, name));
  const zipEntries = zip.getEntries();
  zipEntries.forEach((entry) => {
    const info = {
      isDirectory: entry.isDirectory,
      entryName: entry.entryName.toLowerCase(),
      name: entry.name.toLowerCase(),
      nameExt: (() => {
        const name = entry.name.split(".");
        let ext = undefined;
        if (name.length > 1) {
          ext = name[name.length - 1].toLowerCase();
        }
        return ext;
      })(),
    };
    const dirPath = info.entryName.split("/");
    if (info.isDirectory) {
      if (dirPath.length - 1 > 1) {
        stats.errors.hierarchyLevelViolation.push(info.entryName);
      } else if (!allowedDirectory.find((entry) => entry === dirPath[0])) {
        stats.errors.notAllowedDirectory.push(info.entryName);
      }
    } else {
      if (info.entryName === "index.html") {
        stats.passed["index.html"] = true;
        // reading index.html
        const html = zip.readAsText(entry);

        // scrapping content in index.html;
        const scrapSrc = $("[src]", html);
        const scrapHref = $("[href]", html);
        const relativeUrls = [];
        const absoluteUrls = [];
        const absoluteUrlPattern = /https?/i;
        for (let i = 0; i < scrapSrc.length; i++) {
          const src = scrapSrc[i].attribs.src;
          if (src.search(absoluteUrlPattern) === 0) {
            absoluteUrls.push(src);
          } else {
            relativeUrls.push(src);
          }
        }
        for (let i = 0; i < scrapHref.length; i++) {
          const href = scrapHref[i].attribs.href;
          if (href[0] !== "#") {
            if (href.search(absoluteUrlPattern) === 0) {
              absoluteUrls.push(href);
            } else {
              relativeUrls.push(href);
            }
          }
        }
        stats.referencedUrls.absoluteUrls = absoluteUrls;
        stats.referencedUrls.relativeUrls = relativeUrls;
      } else if (info.nameExt) {
        // file hierarchy validation
        const directory = info.entryName.split("/")[0];
        let possibleDirectory = [];
        // extension for js file
        if (/js/i.test(info.nameExt)) {
          possibleDirectory = ["js"];
          // extension for css file
        } else if (/css/i.test(info.nameExt)) {
          possibleDirectory = ["css"];
          // image files extension
        } else if (/png|jpe?g|gif|pdf|webp/i.test(info.nameExt)) {
          possibleDirectory = ["images", "img", "assets"];
        } else if (
          // video files extension
          /mp4|mov|wmv|avi|avchd|f(l|4)v|swf|mkv|webm/i.test(info.nameExt)
        ) {
          possibleDirectory = ["video", "assets"];
        }
        const found = possibleDirectory.find((entry) => entry === directory);
        if (possibleDirectory.length && !found) {
          stats.errors.filesInWrongDirectory.push(info.entryName.toLowerCase());
        } else if (!found) {
          stats.errors.unSupportedTypeOfFiles.push(
            info.entryName.toLowerCase()
          );
        } else if (dirPath.length - 1 > 1) {
          stats.errors.filesInWrongDirectory.push(info.entryName.toLowerCase());
        } else {
          stats.passed.filesInRightDirectory.push(info.entryName.toLowerCase());
        }
      }
      stats.files.push(info.entryName.toLowerCase());
      stats.totalNumberOfFiles++;
    }
  });
  const relativeUrls = stats.referencedUrls.relativeUrls;

  for (let i = 0; i < relativeUrls.length; i++) {
    const found = stats.files.find(
      (file) => file.toLowerCase() === relativeUrls[i].toLowerCase()
    );
    if (!found) {
      stats.errors.notFoundFiles.push(relativeUrls[i].toLowerCase());
    }
  }
  return stats;
};
