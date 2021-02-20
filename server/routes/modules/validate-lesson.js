// const path = require("path");
const num = require("number-to-words");
const AdmZip = require("adm-zip");

const audioFileExtensions = [
  "3gp",
  "aa",
  "aac",
  "aax",
  "act",
  "aiff",
  "alac",
  "amr",
  "ape",
  "au",
  "awb",
  "dss",
  "dvf",
  "flac",
  "gsm",
  "iklax",
  "ivs",
  "m4a",
  "m4b",
  "m4p",
  "mmf",
  "mp3",
  "mpc",
  "msv",
  "nmf",
  "ogg",
  "oga",
  "mogg",
  "opus",
  "org",
  "ra",
  "rm",
  "raw",
  "rf64",
  "sln",
  "tta",
  "voc",
  "vox",
  "wav",
  "wma",
  "wv",
  "webm",
  "8svx",
  "cda",
];

const imageFileExtensions = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "pdf",
  "gif",
  "eps",
  "tif",
  "tiff",
  "bmp",
  "raw",
  "cr2",
  "nef",
  "orf",
  "sr2",
];

const allowedImageExtensions = ["jpg", "jpeg"];

const group4Names = ["sp", "tp", "sl", "tl"];
const Cnt3group4Names = ["bg"];

module.exports = (path, number) => {
  let audit = {
    failed: {
      lessonNumbers: [],
      time: [],
      mmss: [],
      version: [],
      missingFiles: [],
      invalidFileNames: [],
      invalidFileExtensions: [],
    },
    passed: [],
    files: {
      audioFiles: [],
      imageFiles: [],
      others: [],
    },
    slides: [],
    messages: {
      audio: {
        header: "",
        contents: [],
      },
      contents: [],
    },
  };
  const lesson = {
    number: Number(number),
  };
  let zip = new AdmZip();
  zip.addLocalFolder(path);
  const entries = zip.getEntries();
  entries.forEach((entry) => {
    if (!entry.isDirectory) {
      let counter = 0;
      const fileName = entry.name.split(".");
      const validNameRange = fileName.length >= 4 && fileName.length <= 5;
      // ======================================
      // CHECK FILE NAMING CONVENTION
      // ======================================
      if (!validNameRange) {
        audit.failed.invalidFileNames.push(entry.name);
        counter++;
      } else {
        // Check Group 1 : Lesson Number
        if (
          Number(fileName[0]) !== lesson.number ||
          !(Number(fileName[0]) && fileName[0] !== 0)
        ) {
          audit.failed.lessonNumbers.push(entry.name);
          counter++;
        }
        // Check Group 2 : Time or MMSS
        if (
          !(fileName[1] >= 0 && fileName[1] <= 9) &&
          !(fileName[1].toString().length === 4)
        ) {
          audit.failed.time.push(entry.name);
          counter++;
        }

        if (fileName.length === 5) {
          // Check Group 3 : MMSS
          const group3 = {
            length: fileName[2].toString().length,
            number: Number(fileName[2]),
          };
          if (group3.length !== 4 || (!group3.number && group3.number !== 0)) {
            audit.failed.mmss.push(entry.name);
            counter++;
          }
          // Check Group 4
          if (!group4Names.find((item) => item === fileName[3])) {
            audit.failed.version.push(entry.name);
            counter++;
          }
        }
      }

      // ======================================
      // FILE CHECKING
      // ======================================

      const audioFile = audioFileExtensions.find(
        (item) =>
          item ===
          entry.name
            .split(".")
            .reduceRight((i) => i)
            .toLowerCase()
      );

      if (audioFile) {
        audit.files.audioFiles.push(entry.name);
      } else {
        const imageFile = imageFileExtensions.find(
          (item) =>
            item ===
            entry.name
              .split(".")
              .reduceRight((i) => i)
              .toLowerCase()
        );
        if (imageFile) {
          audit.files.imageFiles.push(entry.name);
          const isAllowed = Boolean(
            allowedImageExtensions.find((item) => item === imageFile)
          );
          if (!isAllowed) {
            audit.failed.invalidFileExtensions.push(entry.name);
            counter++;
          } else {
            const slidesLength = audit.slides.length;
            const sliceFileName = fileName.slice(1, 4);
            const imageVersion = group4Names.find(
              (name) => name === sliceFileName[2]
            );
            if (!slidesLength && fileName.length === 5 && imageVersion) {
              audit.slides.push({ [imageVersion]: entry.name });
            } else if (slidesLength && fileName.length === 5 && imageVersion) {
              // This code snippets below allow file to check and find the existence of its group
              // index: represents the position of the existing group in an array of groups
              const index = audit.slides.findIndex((item) => {
                for (const entry in item) {
                  const slideTime = item[entry]
                    .split(".")
                    .slice(1, 3)
                    .join(".");
                  if (
                    slideTime === [sliceFileName[0], sliceFileName[1]].join(".")
                  ) {
                    return item;
                  }
                }
              });
              // if the file found the index position of the group;
              if (index !== -1 && !counter) {
                // file will then join into the group as one of the array
                audit.slides[index] = {
                  ...audit.slides[index],
                  [imageVersion]: entry.name,
                };
              } else if (!counter) {
                // otherwise create a new group
                audit.slides.push({
                  [imageVersion]: entry.name,
                });
              }
            } else if (
              fileName.length === 4 &&
              Cnt3group4Names.find(
                (name) => name === sliceFileName[1].toLowerCase()
              )
            ) {
              // Do nothing since file passed this audits
            } else {
              audit.failed.invalidFileNames.push(entry.name);
              counter++;
            }
          }
        } else {
          audit.files.others.push(entry.name);
        }
      }
      if (!counter) {
        audit.passed.push(entry.name);
      }
    }
  });

  // =========================================
  // CHECKING FOR SIMPLIFIED AND TRADITIONAL
  // =========================================

  /* As mentioned slides should be available in simplified and traditional Chinese character */

  for (const item of audit.slides) {
    const keys = Object.keys(item);
    keys.forEach((key) => {
      const split = key.split("");
      if (split[0] === "s") {
        const t = keys.find((item) => {
          return item === `t${split[1]}`;
        });
        if (!t) {
          let splitName = item[`${split[0]}${split[1]}`].split(".");
          splitName[3] = `t${split[1]}`;
          const join = splitName.join(".");
          audit.failed.missingFiles.push(join);
        }
      } else if (split[0] === "t") {
        const s = keys.find((item) => {
          return item === `s${split[1]}`;
        });
        if (!s) {
          let splitName = item[`${split[0]}${split[1]}`].split(".");
          splitName[3] = `s${split[1]}`;
          const join = splitName.join(".");
          audit.failed.missingFiles.push(join);
        }
      }
    });
  }

  // =========================================
  // CHECKING VIEW MODE: Landscape, Portrait
  // =========================================
  /* 
  
  A decision should be made wether to require 
  Landscape and Portrait ViewMode 
  
  */

  // for (const item of audit.slides) {
  //   const keys = Object.keys(item);
  //   keys.forEach((key) => {
  //     const viewMode = key.toLowerCase().split("");
  //     if (viewMode[1] === "l") {
  //       const p = keys.find((item) => {
  //         const viewMode2 = item.toLowerCase().split("")[1];
  //         return viewMode2 === "p";
  //       });
  //       if (!p) {
  //         let splitName = item[`${viewMode[0]}l`].split(".");
  //         splitName[3] = "sp";
  //         audit.failed.missingFiles.push(splitName.join("."));
  //       }
  //     } else if (viewMode[1] === "p") {
  //       const l = keys.find((item) => {
  //         const viewMode2 = item.toLowerCase().split("")[1];
  //         return viewMode2 === "l";
  //       });
  //       if (!l) {
  //         let splitName = item[`${viewMode[0]}p`].split(".");
  //         splitName[3] = "sl";
  //         audit.failed.missingFiles.push(splitName.join("."));
  //       }
  //     }
  //   });
  // }

  // =========================================
  // Confirmation Message
  // =========================================
  if (audit.files.audioFiles.length) {
    let numWord = num.toWords(audit.files.audioFiles.length).split("");
    numWord[0] = numWord[0].toUpperCase();
    audit.messages.audio.header = `${numWord.join("")} audio file${
      audit.files.audioFiles.length > 1 ? "s" : ""
    }:`;
    let audioFiles = [];
    for (const audio of audit.files.audioFiles) {
      const min = Number(audio.split(".")[1]);
      audioFiles = [...audioFiles, min];
      audit.messages.audio.contents.push(
        `${min} minute${min > 1 ? "s" : ""} - ${audio}`
      );

      audit.messages.contents.push({
        header: `For ${min} min${min > 1 ? "s" : ""}. version:`,
        contents: (() => {
          const slides = audit.slides.filter((item) => {
            for (const key in item) {
              const min2 = Number(item[key].split(".")[1]);
              if (min2 === min) {
                return item;
              }
            }
          });

          const missingFiles = audit.failed.missingFiles.filter(
            (item) => Number(item.split(".")[1]) === min
          );

          const invalidFileExtensions = audit.failed.invalidFileExtensions
            .filter((item) => Number(item.split(".")[1]) === min)
            .map((item) => `${item} is not a valid file extension`);

          const invalidFileNames = audit.failed.invalidFileNames
            .filter((item) => Number(item.split(".")[1]) === min)
            .map((item) => `${item} is not a valid name`);

          const invalidLessonNumber = audit.failed.lessonNumbers
            .filter((item) => Number(item.split(".")[1]) === min)
            .map((item) => `${item} invalid lesson number`);

          let missingVersions = [];
          let availableVersion = "";
          if (missingFiles.length) {
            availableVersion = "INCOMPLETE";
            for (const item of missingFiles) {
              const split = item.split(".");
              const first3 = split.slice(0, 3).join(".");
              const group4Split = split[3].split("");
              let receivedGroup4 = "";
              let missingGroup4 = split[3];
              if (group4Split[0] === "s") {
                receivedGroup4 = `t${group4Split[1]}`;
              } else if (group4Split[0] === "t") {
                receivedGroup4 = `s${group4Split[1]}`;
              }
              missingVersions = [
                ...missingVersions,
                `${first3} received as ${receivedGroup4} - but ${missingGroup4} missing`,
              ];
            }
          } else {
            availableVersion = "complete in 4 versions";
            for (const version of slides) {
              const keys = Object.keys(version).length;
              if (keys !== 4) {
                availableVersion = "available in 2 version";
              }
            }
          }
          return {
            slidesReceived: `${slides.length} Slide${
              slides.length > 1 ? "s" : ""
            } received - ${availableVersion}`,
            incomplete: missingVersions,
            wrongFileNames: [
              ...invalidLessonNumber,
              ...invalidFileNames,
              ...invalidFileExtensions,
            ],
          };
        })(),
      });
    }
    // **
    // ================================================================
    // CHECK OTHER VIOLATIONS THAT DOESN'T BELONG TO any audio versions
    // ================================================================

    const lessonNumbers = audit.failed.lessonNumbers
      .filter((item) => {
        const num1 = Number(item.split(".")[1]);
        return (
          !audioFiles.find((item2) => {
            const num2 = item2;
            return num2 === num1;
          }) || !num1
        );
      })
      .map((item) => `${item} invalid lesson number`);

    const invalidFileNames = [
      ...audit.failed.time,
      ...audit.failed.mmss,
      ...audit.failed.version,
      ...audit.failed.invalidFileNames,
    ];

    const unique = [];

    for (const item of invalidFileNames) {
      const find = unique.find((item2) => item === item2);
      if (!find) {
        unique.push(item);
      }
    }

    const invalidFileNames2 = unique
      .filter((item) => {
        const num1 = Number(item.split(".")[1]);
        return (
          !audioFiles.find((item2) => {
            const num2 = item2;
            return num2 === num1;
          }) || !num1
        );
      })
      .map((item) => `${item} invalid file name`);

    const invalidFileExtensions = audit.failed.invalidFileExtensions
      .filter((item) => {
        const num1 = Number(item.split(".")[1]);
        return (
          !audioFiles.find((item2) => {
            const num2 = item2;
            return num2 === num1;
          }) || !num1
        );
      })
      .map((item) => `${item} invalid file extension`);

    audit.messages.contents.push({
      header: "Other Violations:",
      contents: (() => {
        return {
          wrongFileNames: [
            ...lessonNumbers,
            ...invalidFileNames2,
            ...invalidFileExtensions,
          ],
        };
      })(),
    });
  }
  return audit;
};
