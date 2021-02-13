'strict mode';

(function () {
  const fileInput = document.querySelector('input[type="file"]');
  const uploadBtn1 = document.querySelector('#upload-btn1');
  const uploadBtn2 = document.querySelector('#upload-btn2');
  const dropzone = document.querySelector('#dropzone');
  const createFolder = document.querySelector('#create-folder');
  const folderModal = document.querySelector('#modal-holder');
  const folderDialog = document.querySelector('.folder-dialog');
  const deleteItem = document.querySelector('#delete-item');
  const deleteDialog = document.querySelector('.delete-dialog');
  const submit = document.querySelector('#submit');
  const body = document.body;

  // event listeners
  body.addEventListener('drop', dropOverTarget);
  body.addEventListener('dragover', dragOverBody);
  dropzone.addEventListener('dragleave', dragLeaveDropzone);
  uploadBtn1.addEventListener('click', () => fileInput.click());
  uploadBtn2.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', fileInputChange);
  folderModal.addEventListener('click', folderModalClick);
  createFolder.addEventListener('click', showModal);
  deleteItem.addEventListener('click', showModal);
  submit.addEventListener('click', () => {
    activateSpinner();
  });

  function showModal() {
    folderModal.classList.add('show');
    const targetID = this.id;
    if (targetID === 'create-folder') {
      folderDialog.classList.add('show');
    } else if (targetID === 'delete-item') {
      deleteDialog.classList.add('show');
    }
  }

  function parseQuery() {
    const regex = new RegExp(`\\?(.*)`);
    const param = {};
    for (const item of window.location.search.match(regex)[1].split('&')) {
      const query = item.split('=');
      param[query[0]] = query[1];
    }
    return param;
  }

  function createUrl(subpath, query) {
    return query.dirname
      ? `/project/${subpath}?name=${query.name}&dirname=${query.dirname}`
      : `/project/${subpath}?name=${query.name}`;
  }

  function fetchRequest(url, json) {
    fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: json,
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

  function folderModalClick(e) {
    const { tagName, id, className } = e.target;
    if (
      tagName === 'svg' ||
      tagName === 'use' ||
      id === 'modal-holder' ||
      className === 'app-second-button'
    ) {
      folderModal.classList.remove('show');
      folderDialog.classList.remove('show');
      deleteDialog.classList.remove('show');
    } else if (id === 'create-folder-btn') {
      const query = parseQuery();
      const url = createUrl('folder', query);
      const json = JSON.stringify({
        folderName: folderDialog.querySelector('input').value,
      });
      fetchRequest(url, json);
    } else if (className === 'app-prim-button') {
      const query = parseQuery();
      const url = createUrl('deletefiles', query);
      const lists = [];
      for (const item of document.querySelectorAll('.table-item')) {
        if (item.checked) {
          lists.push(item.value);
        }
      }
      const json = JSON.stringify({ lists });
      console.log(json);
      fetchRequest(url, json);
    }
  }

  function activateSpinner() {
    const pop = document.querySelector('#pop');
    const spinnerIcon = document.querySelector('.spinner-icon');
    pop.style.display = 'grid';
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
      ? `/project?name=${param.name}&dirname=${param.dirname}`
      : `/project?name=${param.name}`;
    activateSpinner();
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
})();
