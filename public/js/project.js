const fileInput = document.querySelector('input[type="file"]');
const uploadBtn1 = document.querySelector('#upload-btn1');
const uploadBtn2 = document.querySelector('#upload-btn2');
const dropzone = document.querySelector('#dropzone');
const target = document.querySelector('#dropzone .target');
const table = document.querySelector('table > tbody');
// const tr = document.querySelectorAll('tbody > tr');
const createFolderModal = document.querySelector('#create-folder-modal');
const folderModal = document.querySelector('#folder-modal');

const body = document.body;

// event listeners
body.addEventListener('drop', dropOverTarget);
body.addEventListener('dragover', dragOverBody);
dropzone.addEventListener('dragleave', dragLeaveDropzone);
uploadBtn1.addEventListener('click', () => fileInput.click());
uploadBtn2.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', fileInputChange);
createFolderModal.addEventListener('click', e => {
  folderModal.classList.toggle('show');
});
folderModal.addEventListener('click', folderModalClick);

function folderModalClick(e) {
  const targetID = e.target.id.toLowerCase();
  const folderName = document.querySelector('#folder-modal input[type="text"]');
  if (targetID === 'close-folder-modal' || targetID === 'folder-modal') {
    folderModal.classList.toggle('show');
  } else if (targetID === 'create-folder-btn') {
    const regex = new RegExp(`\\?(.*)`);
    const queries = window.location.search.match(regex)[1].split('&');
    const param = {};
    for (const item of queries) {
      const query = item.split('=');
      param[query[0]] = query[1];
    }
    const url = param.dirname
      ? `/project/folder?id=${param.id}&dirname=${param.dirname}`
      : `/project/folder?id=${param.id}`;
    fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folderName: folderName.value }),
    })
      .then(res => {
        if (res.status !== 200) {
          throw new Error(`Upload not sucessful status code: ${res.status}`);
        } else {
          window.location.reload();
        }
      })
      .catch(err => console.log(err));
  }
}

class TableData {
  constructor({ name, size, type }) {
    this.name = name;
    this.size = size;
    this.type = type;
  }
  fileName() {
    element.innerText = this.name;
    return element;
  }
  fileSize() {
    const element = document.createElement('td');
    element.innerText = this.size;
    return element;
  }
  fileType() {
    const element = document.createElement('td');
    element.innerText = this.type;
    return element;
  }
  render() {
    const element = document.createElement('tr');
    element.append(this.fileName());
    element.append(this.fileSize());
    element.append(this.fileType());
    return element;
  }
}

function uploadFiles(files) {
  const fileData = new FormData();
  let i = 0;
  for (const item of files) {
    if (item && item.type) {
      fileData.append(`file${i}`, item);
      i++;
    }
  }

  const regex = new RegExp(`\\?(.*)`);
  const queries = window.location.search.match(regex)[1].split('&');
  const param = {};
  for (const item of queries) {
    const query = item.split('=');
    param[query[0]] = query[1];
  }
  const url = param.dirname
    ? `/project?id=${param.id}&dirname=${param.dirname}`
    : `/project?id=${param.id}`;

  fetch(url, {
    method: 'post',
    body: fileData,
  })
    .then(res => {
      if (res.status !== 200) {
        throw new Error(`Upload not sucessful status code: ${res.status}`);
      } else {
        window.location.reload();
      }
    })
    .catch(err => console.log(err));
}

function fileInputChange(e) {
  console.log('files was added');
  uploadFiles(e.currentTarget.files);
}

function dragOverBody(e) {
  dropzone.classList.add('show');
}

function dragLeaveDropzone(e) {
  console.log('drag leave dropzone');
  dropzone.classList.remove('show');
}

function dropOverTarget(e) {
  dropzone.classList.remove('show');
  uploadFiles(e.dataTransfer.files);
}
