// IIFE
(function () {
  'use strict';
  // variable declaration
  const recommendedMimeType = ['image/jpeg', 'audio/wav', 'audio/mp3'];
  const fileData = new FormData();
  const root = document.querySelector('#root');
  const dropzone = document.querySelector('.dropzone');
  const fileHolder = document.querySelector('.file-holder');
  const buttons = document.querySelector('.buttons');
  const submit = document.querySelector('.submit');
  const addButton = document.querySelector('.addbutton');
  const addButton2 = document.querySelector('.addbutton2');
  const fileInput = document.querySelector('#fileInput');

  // event listeners
  root.addEventListener('dragover', dragOverRoot, true);
  root.addEventListener('drop', dropRoot);
  root.addEventListener('dragleave', dragLeaveRoot);
  dropzone.addEventListener('dragover', dropzoneDragOver, true);
  submit.addEventListener('click', submitHandler);
  fileInput.setAttribute('accept', recommendedMimeType.join());
  fileInput.addEventListener('change', fileInputChange);
  addButton.addEventListener('click', () => fileInput.click());
  addButton2.addEventListener('click', () => fileInput.click());

  // functions
  function fileInputChange(e) {
    console.log('files was added');
    appendFormData(e.currentTarget.files);
    hideDropZoneBorder();
  }

  fileData.errors = [];
  fileData.fileCount = 0;

  fileData.addFile = function (param, index = 0) {
    const key = `file${index}`;
    const file = param;
    this.append(key, file);
    renderFileStats(key, file, index);
    this.fileCount++;
    showFlex();
  };

  function showSubmitButton() {
    if (fileData.fileCount) {
      buttons.classList.add('show');
    } else {
      buttons.classList.remove('show');
    }
  }

  // This function manipulates DOM
  function renderFileStats(fileKey, stats, i) {
    const file = document.createElement('div');
    const fileStats = document.createElement('div');
    const filename = document.createElement('div');
    const filesize = document.createElement('div');
    const deleteFile = document.createElement('span');
    const fileIcon = document.createElement('span');

    file.className = 'file';
    file.id = fileKey;
    fileIcon.className = 'fileIcon';
    fileIcon.innerHTML = `<svg><use href="#file-icon-solid" /></svg>`;
    deleteFile.className = 'deleteIcon';
    deleteFile.innerHTML = `<svg><use href="#close-icon-solid" /></svg>`;
    deleteFile.addEventListener('click', deleteFileHandler);

    function deleteFileHandler(e) {
      const element = e.currentTarget.parentElement;
      fileHolder.removeChild(element);
      const key = element.id.toLowerCase();
      fileData.delete(key);
      fileData.fileCount--;
      hideFlex();
      showSubmitButton();
    }

    fileStats.className = 'fileStats';
    filename.className = 'filename';
    filesize.className = 'filesize';
    filename.innerText = stats.name;

    function calcFileSize() {
      let size = stats.size;
      size = Math.round(size / 1000);

      if (size.toString().length > 3) {
        size = Math.round(size / 1000);
        return `${size} MB`;
      }

      return `${size} KB`;
    }

    filesize.innerHTML = `${calcFileSize()} <span class="checkIcon"><svg><use href="#check-icon-colored" /></svg></span>`;

    const outline = document.createElement('div');
    const inner = document.createElement('div');

    outline.className = 'progressbar-outline';
    inner.className = 'progressbar-inner';
    setTimeout(() => (inner.style.width = '100%'), 100 * i);

    outline.appendChild(inner);
    fileStats.appendChild(filename);
    fileStats.appendChild(filesize);
    fileStats.appendChild(outline);

    file.appendChild(fileIcon);
    file.appendChild(fileStats);
    fileHolder.appendChild(file);
    setTimeout(() => {
      fileStats.removeChild(outline);
      file.appendChild(deleteFile);
    }, 100 * i * 2 + 1000);
  }

  // This functions holds the lists of files that are being dropped,
  // Invalid files are disregarded and will not be included in the lists,
  function appendFormData(param) {
    const files = param;
    for (let i = 0; i < files.length; i++) {
      fileData.addFile(files[i], i + 1);
    }
  }

  function hideDropZoneBorder() {
    dropzone.classList.remove('showborder');
    root.style.removeProperty('display');

    if (fileData.fileCount) {
      fileHolder.classList.add('showflex');
      buttons.classList.add('show');
      hideUI(true);
    }
  }

  function showDropZoneBorder() {
    dropzone.classList.add('showborder');
    root.style.display = 'grid';
    buttons.classList.remove('show');
    hideUI(false);
  }

  function hideUI(boolean = false) {
    if (boolean) {
      dropzone.classList.add('hideui');
    } else {
      dropzone.classList.remove('hideui');
    }
  }

  function showFlex() {
    if (fileData.fileCount) {
      fileHolder.classList.add('showflex');
      showSubmitButton();
    }
  }

  function hideFlex() {
    if (!fileData.fileCount) {
      fileHolder.classList.remove('showflex');
      showSubmitButton();
      showDropZoneBorder();
      dropzone.classList.remove('showborder');
    }
  }

  function disablePointer(element) {
    element.classList.add('no-pointer');
  }

  function enablePointer(element) {
    element.classList.remove('no-pointer');
  }

  function dragOverRoot(e) {
    e.preventDefault();
    e.stopPropagation();
    showDropZoneBorder();
    buttons.classList.remove('show');
    disablePointer(e.currentTarget);
  }

  function dragLeaveRoot(e) {
    const element = e.currentTarget;
    hideDropZoneBorder();
    showSubmitButton();
    disablePointer(element);
    if (e.target.tagName.toLowerCase() === 'body') {
      enablePointer(element);
    }
  }

  function dropRoot(e) {
    e.preventDefault();
    console.log('files was dropped');
    appendFormData(e.dataTransfer.files);
    hideDropZoneBorder();
    enablePointer(e.currentTarget);
  }

  function dropzoneDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('dragged on the dropzone');
    hideDropZoneBorder();
  }

  function activateSpinner() {
    const pop = document.querySelector('#pop');
    const spinnerIcon = document.querySelector('.spinner-icon');
    pop.style.display = 'grid';
    spinnerIcon.classList.add('animate');
  }

  function deactivateSpinner() {
    const pop = document.querySelector('#pop');
    const spinnerIcon = document.querySelector('.spinner-icon');
    pop.style.removeProperty('display');
    spinnerIcon.classList.remove('animate');
  }

  function submitHandler(e) {
    if (fileData.fileCount) {
      activateSpinner();
      fetch('/upload', {
        method: 'post',
        redirect: 'follow',
        body: fileData,
      })
        .then(res => {
          deactivateSpinner();
          console.log(res);
          if (res.status > 399) {
            throw new Error(`Upload failed response status code ${res.status}`);
          }
          return res.json();
        })
        .then(text => {
          console.log(text);
        })
        .catch(err => {
          console.log(err);
          deactivateSpinner();
        });
    }
  }
})();
