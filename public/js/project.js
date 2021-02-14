'strict mode';

(function () {
  const fileInput = document.querySelector('input[type="file"]');
  const uploadBtn1 = document.querySelector('#upload-btn1');
  const dropzone = document.querySelector('#dropzone');
  const submit = document.querySelector('#submit');
  const body = document.body;

  // event listeners
  body.addEventListener('drop', dropOverTarget);
  body.addEventListener('dragover', dragOverBody);
  dropzone.addEventListener('dragleave', dragLeaveDropzone);
  uploadBtn1.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', fileInputChange);
  submit.addEventListener('click', () => {
    activateSpinner();
  });

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
