module.exports = [
  {
    secret: "blue-elephant",
    projectName: "www.voicestream.app", // Website submission
    allowed: ["css", "htm", "html", "js", "jpg", "svg"],
    destination: "voicestream", // <- this would be the bucket name
    versioning: true,
    allowBeta: true,
    allowProd: false,
  },
  {
    secret: "blue-elephant",
    projectName: "www.domainster.com",
    allowed: ["css", "htm", "html", "js", "jpg", "svg"],
    destination: "domainster",
    versioning: true,
    allowBeta: true,
    allowProd: true,
  },
  {
    secret: "mickey-mouse",
    projectName: "www.kobe.com",
    allowed: ["aiff", "jpg", "mp3"],
    destination: "chinesepod",
    versioning: true,
    allowBeta: true,
    allowProd: true,
  },
  {
    secret: "talking-tom", // submission for lesson
    lessonNumber: 1234,
  },
  {
    secret: "talking-tom",
    lessonNumber: 7865,
  },
  {
    secret: "talking-tom",
    lessonNumber: 4123,
  },
];
