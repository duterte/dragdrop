//api list
const UPLOAD_SERVER_API = "/chinesepod/stats";
const GET_FTP_FILE_NAMES_API = "/chinesepod/stats";

//check file name
const CHECK_FILE_SUCCESS_CODE = 0;
const CHECK_FILE_INVALID_LESSON_NUMBER_CODE = 1;
const CHECK_FILE_INVALID_EXTENSION_CODE = 2;
const CHECK_FILE_INVALID_NAME_CODE = 3;
//file type
const FILE_TYPE_OTHER = 0;
const FILE_TYPE_AUDIO = 1;
const FILE_TYPE_SLIDE = 2;
//check status
const CHECK_STATUS_SUCCESS = 1;
const CHECK_STATUS_FAIL = 0;

const BATCH_UPLOAD_COUNT_LIMIT = 5;

//describe file upload status
const UPLOAD_STATUS_PENDING = 0;
const UPLOAD_STATUS_UPLOADING = 1;
const UPLOAD_STATUS_SUCCESS = 2;
const UPLOAD_STATUS_FAIL = 3;

const SLIDES_TYPE = ["sp", "tp", "sl", "tl"];
const IMAGE_FILE_TYPE_ARRAY = ["jpg"];
const AUDIO_FILE_TYPE_ARRAY = ["mp3", "wav"];

var jq = jQuery.noConflict();
var selectedFiles = [],
  hasUploadFileIndexs = [],
  nextFileIndex = 0;

var checkResult = initCheckResult();
var audioSlidesMap = initAudioSlidesMap();

function ValidateLessonNumberAndShowSummary(inputText) {
  validResult = ValidateLessonNumber(inputText.value);
  if (!validResult) {
    return;
  }
  jq("#LessonIdNumber").html(inputText.value);
  jq(inputText).prop("disabled", true);

  showLoadStyleAndCheckResult();
  cancelUploadAndInitData();
}

function showLoadStyleAndCheckResult(selectedFileNames = []) {
  jq(".cp-compiler-wrap").removeClass("cp-fth-content-active");
  jq(".cp-compiler-wrap").addClass("cp-fth-loader-active");

  jq.when(getUploadedFileNames()).done(function (uploaded_file_names) {
    jq(".cp-compiler-wrap").removeClass("cp-fth-loader-active");
    jq(".cp-compiler-wrap").addClass("cp-fth-content-active");
    needCheckFileNames = combineArrayToBeUnique(
      selectedFileNames,
      uploaded_file_names
    );
    if (getObjectOrArrayLength(needCheckFileNames) == 0) {
      jq(".cp-compiler-wrap").hide();
    } else {
      checkFilesAndShowSummary(needCheckFileNames);
      document.querySelectorAll(".box")[0].classList.add("has-advanced-upload");
    }
    jq(".cp-drag-assets").addClass("active");
    showButtonByCheckStatus(checkResult.status);
  });
}

function ValidateLessonNumber(lessonNumber) {
  var reg = /^([0-9]{4}|[A-Z]{2}[0-9]{4})$/;
  if (!reg.test(lessonNumber)) {
    alert("please input valid lesson number");
    jq(".cp-fth-cover .spinner-border").removeClass("text-success");
    jq(".cp-fth-cover .cp-fth-title").html("Connecting to Server...");
    jq(".cp-compiler-wrap").removeClass("cp-fth-loader-active");
    jq(".cp-compiler-wrap").removeClass("cp-fth-content-active");
    jq(".cp-drag-assets").removeClass("active");
    return false;
  }
  return true;
}

("use strict");

(function (document, window, index) {
  // feature detection for drag&drop upload
  var isAdvancedUpload = (function () {
    var div = document.createElement("div");
    return (
      ("draggable" in div || ("ondragstart" in div && "ondrop" in div)) &&
      "FormData" in window &&
      "FileReader" in window
    );
  })();

  // applying the effect for every form
  var forms = document.querySelectorAll(".box");
  Array.prototype.forEach.call(forms, function (form) {
    var input = form.querySelector('input[type="file"]');

    // letting the server side to know we are going to make an Ajax request
    var ajaxFlag = document.createElement("input");
    ajaxFlag.setAttribute("type", "hidden");
    ajaxFlag.setAttribute("name", "ajax");
    ajaxFlag.setAttribute("value", 1);
    form.appendChild(ajaxFlag);

    // automatically submit the form on file select
    input.addEventListener("change", function (e) {
      addAndShowFiles(e.target.files);
    });

    // drag&drop files if the feature is available
    if (isAdvancedUpload) {
      form.classList.add("has-advanced-upload"); // letting the CSS part to know drag&drop is supported by the browser

      [
        "drag",
        "dragstart",
        "dragend",
        "dragover",
        "dragenter",
        "dragleave",
        "drop",
      ].forEach(function (event) {
        form.addEventListener(event, function (e) {
          // preventing the unwanted behaviours
          e.preventDefault();
          e.stopPropagation();
        });
      });
      ["dragover", "dragenter"].forEach(function (event) {
        form.addEventListener(event, function () {
          form.classList.add("is-dragover");
        });
      });
      ["dragleave", "dragend", "drop"].forEach(function (event) {
        form.addEventListener(event, function () {
          form.classList.remove("is-dragover");
        });
      });
      form.addEventListener("drop", function (e) {
        // the files that were dropped
        addAndShowFiles(e.dataTransfer.files);
      });

      form.addEventListener("click", function (e) {
        var _con = jq(".file_remove_btn");
        if (!_con.is(e.target) && _con.has(e.target).length === 0) {
          input.click();
        }
      });
    }
    // Firefox focus bug fix for file input
    input.addEventListener("focus", function () {
      input.classList.add("has-focus");
    });
    input.addEventListener("blur", function () {
      input.classList.remove("has-focus");
    });
  });
})(document, window, 0);

function addAndShowFiles(files) {
  showWaitCheckProgressButtons();
  var newFiles = addFiles(files);
  showFileListByNeedUploadFiles(newFiles);
}

function addFiles(files) {
  var newFiles = [];
  for (var i = 0; i < files.length; i++) {
    if (checkFileIsExists(files[i].name)) {
      continue;
    }
    selectedFiles[nextFileIndex] = files[i];
    newFiles[nextFileIndex] = files[i];
    nextFileIndex++;
  }
  return newFiles;
}

function checkFileIsExists(fileName) {
  for (index in selectedFiles) {
    if (selectedFiles[index].name === fileName) {
      return true;
    }
  }
  return false;
}

//show file list
function showFileListByNeedUploadFiles(files) {
  jq(".box_upload_file_list").show();
  var html = document.getElementById("file_list").innerHTML;
  for (index in files) {
    file = files[index];
    html +=
      '<li id="file_list_' +
      index +
      '">' +
      '<img src="/file.png" class="file_avatar">' +
      '<div class="file_info">' +
      "<div>" +
      '<div class="file_name">' +
      file.name +
      "</div>" +
      '<div class="file_size">' +
      transferSizeUnit(file.size) +
      "</div>" +
      "</div>" +
      '<div class="process_box">' +
      '<div class="process_bar">' +
      '<div class="bar" style="width:0%">' +
      '<div class="process_size" style="display: none">0%</div>' +
      "</div>" +
      "</div>" +
      '<div class="upload_status" style="color:gray">pending</div>' +
      "</div>" +
      '<div class="file_remove_btn" onClick="removeFile(' +
      index +
      ')">X</div>' +
      "</div>" +
      "</li>";
  }
  document.getElementById("file_list").innerHTML = html;
}

function transferSizeUnit(size) {
  var length = size.toString().length;
  if (length <= 3) {
    return size + "B";
  } else if (length > 3 && length <= 6) {
    return (size / 1024).toFixed(2) + "K";
  } else if (length > 6 && length <= 9) {
    return (size / 1024 / 1024).toFixed(2) + "M";
  } else {
    return (size / 1024 / 1024 / 1024).toFixed(2) + "G";
  }
}

//remove file
function removeFile(index) {
  stopBubbling();

  document.getElementById("file_list_" + index).remove();
  delete selectedFiles[index];
  if (getObjectOrArrayLength(selectedFiles) == 0) {
    jq(".box_upload_file_list").hide();
  }
}

//when click finish,then check the files
function checkFilesAfterSelect() {
  stopBubbling();
  jq(".cp-compiler-wrap").show();
  if (getObjectOrArrayLength(selectedFiles) == 0) {
    alert("please select files first");
    return false;
  }
  showLoadStyleAndCheckResult(getNeedUploadFileNames());
}

//show button after check files
function showButtonByCheckStatus(checkStatus) {
  if (getObjectOrArrayLength(selectedFiles) == 0) {
    return;
  }
  if (checkStatus == CHECK_STATUS_SUCCESS) {
    showCheckSuccessButtons();
  } else {
    showCheckFailButtons();
  }
}

//upload files
function uploadAssets() {
  stopBubbling();

  jq(".file_remove_btn").hide();
  jq(".button_cancel").hide();

  keys = Object.keys(selectedFiles);
  for (
    keyIndex = 0;
    keyIndex < Math.min(BATCH_UPLOAD_COUNT_LIMIT, keys.length);
    keyIndex++
  ) {
    key = keys[keyIndex];
    uploadSingleFile(selectedFiles[key], keyIndex, keys);
  }
}

//upload file
function uploadSingleFile(file, keyIndex, keys) {
  var currentFileIndex = keys[keyIndex];
  isUpload = checkIsUploadByIndex(currentFileIndex);
  if (isUpload) {
    uploadSingleFileByKeyIndex(keyIndex + BATCH_UPLOAD_COUNT_LIMIT, keys);
  } else {
    var formData = new FormData();
    formData.append("files", file);
    formData.append("ajax", 1);
    showFileUploadStatus(currentFileIndex, UPLOAD_STATUS_UPLOADING);

    var ajax = new XMLHttpRequest();
    ajax.open("post", UPLOAD_SERVER_API, true);
    ajax.onload = function () {
      if (ajax.status >= 200 && ajax.status < 400) {
        var data = JSON.parse(ajax.responseText);
        // START TEST

        // hard coded for testing purposes only
        data.success = true;
        // END TEST
        if (data.success) {
          hasUploadFileIndexs.push(currentFileIndex);
          showFileUploadStatus(currentFileIndex, UPLOAD_STATUS_SUCCESS);
        } else {
          showFileUploadStatus(currentFileIndex, UPLOAD_STATUS_FAIL);
        }
      } else {
        showFileUploadStatus(currentFileIndex, UPLOAD_STATUS_FAIL);
      }
    };
    ajax.onerror = function () {
      showFileUploadStatus(currentFileIndex, UPLOAD_STATUS_FAIL);
    };
    ajax.upload.onprogress = function (e) {
      if (e.lengthComputable) {
        var progress = (e.loaded / e.total).toFixed(2) * 100 + "%";
        jq("#file_list_" + currentFileIndex)
          .find(".bar")
          .css("width", progress);
        jq("#file_list_" + currentFileIndex)
          .find(".process_size")
          .text(progress)
          .show();
      }
    };
    ajax.onloadend = function () {
      uploadSingleFileByKeyIndex(keyIndex + BATCH_UPLOAD_COUNT_LIMIT, keys);
    };
    ajax.send(formData);
  }
}

function checkIsUploadByIndex(currentFileIndex) {
  return jq.inArray(currentFileIndex, hasUploadFileIndexs) != -1 ? true : false;
}

function uploadSingleFileByKeyIndex(keyIndex, keys) {
  currentFileIndex = keys[keyIndex];
  if (selectedFiles.hasOwnProperty(currentFileIndex)) {
    uploadSingleFile(selectedFiles[currentFileIndex], keyIndex, keys);
  }
}

function showFileUploadStatus(index, status) {
  if (status == UPLOAD_STATUS_SUCCESS) {
    jq("#file_list_" + index)
      .find(".upload_status")
      .text("success")
      .css("color", "green");
  } else if (status == UPLOAD_STATUS_UPLOADING) {
    jq("#file_list_" + index)
      .find(".upload_status")
      .text("uploading")
      .css("color", "blue");
  } else if (status == UPLOAD_STATUS_PENDING) {
    jq("#file_list_" + index)
      .find(".upload_status")
      .text("pending")
      .css("color", "gray");
  } else {
    jq("#file_list_" + index)
      .find(".upload_status")
      .text("fail")
      .css("color", "red");
  }
}

function cancelUploadAndInitData() {
  stopBubbling();

  selectedFiles = [];
  hasUploadFileIndexs = [];
  nextFileIndex = 0;
  showWaitCheckProgressButtons();
  jq(".box_upload_file_list").hide();
}

function showWaitCheckProgressButtons() {
  jq(".button_finish").show();
  jq(".button_upload").hide();
  jq(".button_cancel").hide();
}

function showCheckFailButtons() {
  jq(".button_finish").hide();
  jq(".button_upload").show();
  jq(".button_cancel").show();
}

function showCheckSuccessButtons() {
  jq(".button_finish").hide();
  jq(".button_upload").show();
  jq(".button_cancel").hide();
}

function getObjectOrArrayLength(data) {
  return Object.keys(data).length;
}

function stopBubbling() {
  e = window.event;
  if (e.stopPropagation) {
    e.stopPropagation();
  } else {
    e.cancelBubble = true; //for ie
  }
}

function formatTimeUnit(time) {
  var unit = "";
  if (time == 9) {
    return "90s";
  } else if (time == 1) {
    unit = " min";
  } else {
    unit = " mins";
  }
  return time + unit;
}

function getUploadedFileNames() {
  var defer = jq.Deferred();
  var ajax = new XMLHttpRequest();
  var formData = new FormData();
  formData.append("lesson_number", getLessonNumber());
  formData.append("ajax", 1);

  var uploadedFileNames = [];
  ajax.open("post", GET_FTP_FILE_NAMES_API, true);
  ajax.onload = function () {
    var data = JSON.parse(ajax.responseText);
    if (data.success) {
      uploadedFileNames = data.uploaded_file_names;
    }
    defer.resolve(uploadedFileNames);
  };
  ajax.onerror = function () {
    alter("Network Error");
  };
  ajax.send(formData);

  return defer.promise();
}

function getNeedUploadFileNames() {
  var needUploadFileNames = [];
  for (index in selectedFiles) {
    needUploadFileNames.push(selectedFiles[index].name);
  }
  return needUploadFileNames;
}

function combineArrayToBeUnique(array1, array2) {
  var maxArray = [],
    minArray = [];
  if (getObjectOrArrayLength(array1) > getObjectOrArrayLength(array2)) {
    maxArray = array1;
    minArray = array2;
  } else {
    maxArray = array2;
    minArray = array1;
  }
  for (var i = 0; i < minArray.length; i++) {
    if (jq.inArray(minArray[i], maxArray) != -1) {
      continue;
    }
    maxArray.push(minArray[i]);
  }
  return maxArray;
}

function checkFilesAndShowSummary(fileNames) {
  getAudioSlidesMap(fileNames);
  getCheckResult();
  showSummary();
}

function getAudioSlidesMap(fileNames) {
  initCheckResult();
  validFileNames = filterFileName(fileNames);
  return groupFiles(validFileNames);
}

function getCheckResult() {
  checkResult.summary.backgroundSlides = audioSlidesMap.backgroundSlides.slice();
  var reg = /^[0-9]{1}$/;
  for (var index in audioSlidesMap) {
    if (reg.test(index)) {
      checkSingleAudioSlide(index, audioSlidesMap[index]);
    }
  }
}

function checkSingleAudioSlide(time, data) {
  if (getObjectOrArrayLength(data.audio) == 0) {
    for (var imgOrder in data.slides) {
      checkResult.summary.no_match_audio_slides = combineArrayToBeUnique(
        checkResult.summary.no_match_audio_slides,
        data.slides[imgOrder]
      );
    }
    checkResult.status = CHECK_STATUS_FAIL;
  } else {
    if (!checkResult.summary.audioSlidesResult.hasOwnProperty(time)) {
      checkResult.summary.audioSlidesResult[time] = initAudioSlideResult();
    }
    for (var imgOrder in data.slides) {
      currentSlideTypes = getSlidesType(data.slides[imgOrder]);
      for (var i = 0; i < getObjectOrArrayLength(SLIDES_TYPE); i++) {
        if (jq.inArray(SLIDES_TYPE[i], currentSlideTypes) == -1) {
          checkResult.status = CHECK_STATUS_FAIL;
          checkResult.summary.audioSlidesResult[
            time
          ].status = CHECK_STATUS_FAIL;
          checkResult.summary.audioSlidesResult[time].error_msg.push(
            getConsistencyCheckError(time, imgOrder, SLIDES_TYPE[i])
          );
        } else {
          if (jq.inArray(SLIDES_TYPE[i], ["sp", "tp"]) != -1) {
            checkResult.summary.audioSlidesResult[time].count.portrait++;
          } else {
            checkResult.summary.audioSlidesResult[time].count.landscape++;
          }
        }
      }
    }
  }
}

function getSlidesType(slides) {
  var slideType = [];
  for (var index in slides) {
    splitResult = slides[index].split(".");
    if (jq.inArray(splitResult[3].toLowerCase(), SLIDES_TYPE) != -1) {
      slideType.push(splitResult[3].toLowerCase());
    }
  }
  return slideType;
}

function getConsistencyCheckError(time, imgOrder, slideType) {
  return (
    getLessonNumber() +
    "." +
    time +
    "." +
    imgOrder +
    " " +
    slideType +
    " is missing!"
  );
}

function showSummary(summary) {
  jq(".cp-compiler-wrap").show();
  var audioSlidesResult = checkResult.summary.audioSlidesResult;
  var html = "";

  if (getObjectOrArrayLength(checkResult.summary.backgroundSlides) != 0) {
    html += getBackgroundSlidesHtml(checkResult.summary.backgroundSlides);
  }

  var times = Object.keys(audioSlidesResult);
  if (getObjectOrArrayLength(times) != 0) {
    html += getPresentAudioDescHtml(times);
  }

  for (time in audioSlidesResult) {
    html += getAudioSlidesSummaryHtml(time, audioSlidesResult[time]);
  }

  if (getObjectOrArrayLength(checkResult.summary.no_match_audio_slides) != 0) {
    html += getNoMatchAudioFilesHtml(checkResult.summary.no_match_audio_slides);
  }

  if (getObjectOrArrayLength(checkResult.summary.wrong_files) != 0) {
    html += getWrongFilesHtml(checkResult.summary.wrong_files);
  }

  html += getEndDescHtml(checkResult.status);
  document.getElementsByClassName("cmp-list")[0].innerHTML = html;
}

function getPresentAudioDescHtml(times) {
  var html = "<li>Audio files present for ";
  for (var i = 0; i < getObjectOrArrayLength(times); i++) {
    html += formatTimeUnit(times[i]);
    if (i < getObjectOrArrayLength(times) - 2) {
      html += ", ";
    } else if (i == getObjectOrArrayLength(times) - 2) {
      html += " and ";
    } else {
      html += ".";
    }
  }
  html += "</li>";
  return html;
}

function getBackgroundSlidesHtml(backgroundSlides) {
  var html = "<li>Background slides</li>";
  html += "<ul>";
  for (index in backgroundSlides) {
    html += "<li>" + backgroundSlides[index] + "</li>";
  }
  html += "</ul>";
  return html;
}

function getAudioSlidesSummaryHtml(time, audioSlidesResult) {
  var html = "";
  html +=
    formatTimeUnit(time) +
    ".: " +
    (audioSlidesResult.count.landscape + audioSlidesResult.count.portrait) +
    " Slides received, " +
    (audioSlidesResult.status == CHECK_STATUS_SUCCESS
      ? "complete!"
      : "imcompelete!");

  if (audioSlidesResult.status == CHECK_STATUS_FAIL) {
    html += "<ul>";
    for (var i in audioSlidesResult.error_msg) {
      html += "<li>" + audioSlidesResult.error_msg[i] + "</li>";
    }
    html += "</ul><br/>";
  }
  return html;
}

function getNoMatchAudioFilesHtml(noMatchAudioSlides) {
  var html = "<li>No match audio slides</li>";
  html += "<ul>";
  for (index in noMatchAudioSlides) {
    html += "<li>" + noMatchAudioSlides[index] + "</li>";
  }
  html += "</ul><br/>";
  return html;
}

function getWrongFilesHtml(wrongFileReasons) {
  var html = "<li>Wrong file names</li>";
  html += "<ul>";
  for (index in wrongFileReasons) {
    html += "<li>" + wrongFileReasons[index] + "</li>";
  }
  html += "</ul><br/>";
  return html;
}

function getEndDescHtml(status) {
  if (status == CHECK_STATUS_SUCCESS) {
    return "<li>No consistency errors detected</li>";
  } else {
    return (
      "<li>Lesson cannot be marked complete</li>" +
      "<li>Please correct errors and submit again</li>"
    );
  }
}

function filterFileName(fileNames) {
  initAudioSlidesMap();
  var validFileNames = [];
  for (var i = 0; i < fileNames.length; i++) {
    validFileNameAndGroupByType(fileNames[i], validFileNames);
  }
  return validFileNames;
}

function getFileType(extension) {
  if (jq.inArray(extension.toLowerCase(), AUDIO_FILE_TYPE_ARRAY) != -1) {
    fileType = FILE_TYPE_AUDIO;
  } else if (jq.inArray(extension.toLowerCase(), IMAGE_FILE_TYPE_ARRAY) != -1) {
    fileType = FILE_TYPE_SLIDE;
  } else {
    fileType = FILE_TYPE_OTHER;
  }
  return fileType;
}

function validFileNameAndGroupByType(fileName, validFileNames) {
  splitResult = fileName.split(".");
  extension = splitResult.pop();
  group = splitResult;

  fileType = getFileType(extension);

  if (fileType == FILE_TYPE_OTHER) {
    dealWithCheckFileNameFail(fileName, CHECK_FILE_INVALID_EXTENSION_CODE);
    return;
  }

  checkCode = verifyNameByGroup(group, fileType);

  if (checkCode == CHECK_FILE_SUCCESS_CODE) {
    validFileNames.push(fileName);
  } else {
    dealWithCheckFileNameFail(fileName, checkCode);
  }
}

function dealWithCheckFileNameFail(fileName, checkCode) {
  audioSlidesMap.wrong_files.push(fileName);
  checkResult.summary.wrong_files.push(
    getCheckFileNameErrorMessage(fileName, checkCode)
  );
  checkResult.status = CHECK_STATUS_FAIL;
}

function verifyNameByGroup(group, fileType) {
  if (group.length != 3 && group.length != 4) {
    return CHECK_FILE_INVALID_NAME_CODE;
  }
  if (group[0] != getLessonNumber()) {
    return CHECK_FILE_INVALID_LESSON_NUMBER_CODE;
  }
  return fileType == FILE_TYPE_AUDIO
    ? verifyFileAsAudio(group)
    : verifyFileAsSlide(group);
}

function verifyFileAsAudio(group) {
  if (group.length != 3) {
    return CHECK_FILE_INVALID_NAME_CODE;
  }
  var reg = /^[0-9]{1}$/;
  if (!reg.test(group[1])) {
    return CHECK_FILE_INVALID_NAME_CODE;
  }
  return CHECK_FILE_SUCCESS_CODE;
}

function verifyFileAsSlide(group) {
  var reg = /^(0000|[0-9]{1})$/;
  if (!reg.test(group[1])) {
    return CHECK_FILE_INVALID_NAME_CODE;
  }
  if (group.length == 3) {
    if (group[1] != "0000" || group[2] != "bg") {
      return CHECK_FILE_INVALID_NAME_CODE;
    }
  } else {
    if (jq.inArray(group[3].toLowerCase(), ["tp", "tl", "sp", "sl"]) == -1) {
      return CHECK_FILE_INVALID_NAME_CODE;
    }
  }
  return CHECK_FILE_SUCCESS_CODE;
}

function getCheckFileNameErrorMessage(fileName, type) {
  if (type == CHECK_FILE_INVALID_EXTENSION_CODE) {
    message = " is not a valid file extension";
  } else if (type == CHECK_FILE_INVALID_LESSON_NUMBER_CODE) {
    message = " Lesson Number does not correspond with Lesson Entered";
  } else {
    message = " is not a valid name";
  }
  return fileName + message;
}

function groupFiles(fileNames) {
  for (var i = 0; i < fileNames.length; i++) {
    fileName = fileNames[i];
    splitResult = fileName.split(".");
    extension = splitResult.pop();
    group = splitResult;

    if (group[1] == "0000" && group[2] == "bg") {
      audioSlidesMap["backgroundSlides"].push(fileName);
      continue;
    }
    if (!audioSlidesMap.hasOwnProperty(group[1])) {
      audioSlidesMap[group[1]] = initAudioSlideData();
    }
    fileType = getFileType(extension);
    if (fileType == FILE_TYPE_AUDIO) {
      audioSlidesMap[group[1]]["audio"].push(fileName);
    } else {
      if (!audioSlidesMap[group[1]]["slides"].hasOwnProperty(group[2])) {
        audioSlidesMap[splitResult[1]]["slides"][group[2]] = initSlidesData();
      }
      audioSlidesMap[group[1]]["slides"][group[2]].push(fileName);
    }
  }
}

function initCheckResult() {
  return (checkResult = {
    status: CHECK_STATUS_SUCCESS,
    summary: {
      backgroundSlides: {},
      audioSlidesResult: {},
      no_match_audio_slides: [],
      wrong_files: [],
    },
  });
}

function initAudioSlideResult() {
  return (audioSlideResult = {
    status: CHECK_STATUS_SUCCESS,
    count: {
      landscape: 0,
      portrait: 0,
    },
    error_msg: [],
  });
}

function initAudioSlidesMap() {
  return (audioSlidesMap = {
    backgroundSlides: [],
    wrong_files: [],
  });
}

function initAudioSlideData() {
  return (audioSlideData = {
    audio: [],
    slides: {},
  });
}

function initSlidesData() {
  return (slideData = []);
}

function getLessonNumber() {
  return document.fetchLessonForm.lessonNumber.value;
}
