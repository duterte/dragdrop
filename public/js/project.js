'strict mode';

(function () {
  const fileInput = document.querySelector('input[type="file"]');
  const uploadBtn1 = document.querySelector('#upload-btn1');
  const dropzone = document.querySelector('#dropzone');
  const submit = document.querySelector('#submit');
  const body = document.body;
  let counter = 0;
  let loadend = 0;
  // event listeners
  body.addEventListener('drop', (e) => {
    dropzone.classList.remove('show');
    uploadFiles(e.dataTransfer.files);
  });
  body.addEventListener('dragover', (e) => dropzone.classList.add('show'));
  dropzone.addEventListener('dragleave', (e) =>
    dropzone.classList.remove('show')
  );
  uploadBtn1.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) =>
    uploadFiles(e.currentTarget.files)
  );
  submit.addEventListener('click', () => activateSpinner());

  // function activateSpinner() {
  //   const pop = document.querySelector('#pop');
  //   const spinnerIcon = document.querySelector('.spinner-icon');
  //   pop.style.display = 'grid';
  //   spinnerIcon.classList.add('animate');
  // }

  function calcFileSize(size = 0) {
    const bytes = size;
    const kiloBytes = Math.round(bytes / 1024);
    const megaBytes = Math.round(kiloBytes / 1024);
    const gigaBytes = Math.round(megaBytes / 1024);
    if (gigaBytes) return gigaBytes + ' GB';
    if (megaBytes) return megaBytes + ' MB';
    if (kiloBytes) return kiloBytes + ' KB';
    return bytes + ' Bytes';
  }

  class FileUploadUI {
    constructor({ name = '', size = 0, id = '' }) {
      this.name = name;
      this.size = size;
      this.id = id;
    }

    fileName() {
      const element = document.createElement('div');
      element.className = 'file-name';
      element.innerText = this.name;
      return element;
    }

    fileSize() {
      const element = document.createElement('div');
      element.className = 'file-size';
      element.innerText = calcFileSize(this.size);
      return element;
    }

    process() {
      const element = document.createElement('div');
      element.className = 'processing';
      element.innerText = 'Browser is processing the file';
      return element;
    }

    started() {
      const element = document.createElement('div');
      element.className = 'started';
      element.innerText = 'started';
      return element;
    }

    progressIndicator() {
      const parent = document.createElement('div');
      const child = document.createElement('div');
      child.className = 'progress-inner';
      child.style.width = '0%';
      parent.className = 'progress-outer';
      parent.append(child);
      return parent;
    }

    netErr() {
      const element = document.createElement('div');
      element.className = 'failed';
      element.innerText =
        'Oops!!! upload has failed, ' +
        'You may try to drag and drop to upload this file again';
      return element;
    }

    render() {
      const root = document.createElement('div');
      root.className = 'file';
      root.id = this.id;

      root.append(this.fileName());
      root.append(this.fileSize());
      root.append(this.process());
      root.append(this.started());
      root.append(this.progressIndicator());
      root.append(this.netErr());
      return root;
    }
  }

  function fileInterface({}) {
    const root = document.getElementById('upload-interface');
    const wrapper = root.querySelector('.wrapper');
    root.style.display('block');
    wrapper.append();
  }

  function upload(file, id) {
    const fileUI = document.getElementById(id);
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    const processing = fileUI.querySelector('.processing');
    const started = fileUI.querySelector('.started');
    const progressOuter = fileUI.querySelector('.progress-outer');
    const progressInner = fileUI.querySelector('.progress-inner');
    const failed = fileUI.querySelector('.failed');

    processing.style.display = 'block';

    formData.append('file0', file);
    xhr.open('POST', '/project');
    xhr.upload.addEventListener('loadstart', (e) => {
      if (processing) processing.remove();
      started.style.display = 'block';
    });

    xhr.upload.addEventListener('progress', (e) => {
      const { lengthComputable, loaded, total } = e;
      const progress = lengthComputable ? (loaded / total) * 100 : 0;

      if (processing) processing.remove();
      if (started) started.remove();

      progressOuter.style.display = 'block';
      progressInner.style.width = progress + '%';
      progressInner.innerText = Math.round(progress) + '%';

      if (progressInner.style.width === '100%') {
        progressInner.style.backgroundColor = '#0cc70ced';
      }
    });

    xhr.upload.addEventListener('abort', (e) => {
      console.log('upload aborted');
      console.log(e);
      failed.style.display = 'block';
      fileUI.style.border = '1px solid red';
      fileUI.style.boxShadow = 'none';
      progressInner.style.backgroundColor = '#ed7164';
    });

    xhr.upload.addEventListener('error', (e) => {
      console.log('upload error');
      console.log(e);
      failed.style.display = 'block';
      fileUI.style.border = '1px solid red';
      fileUI.style.boxShadow = 'none';
      progressInner.style.backgroundColor = '#ed7164';
    });

    xhr.upload.addEventListener('timeout', (e) => {
      console.log('upload timeout');
      console.log(e);
      failed.style.display = 'block';
      fileUI.style.border = '1px solid red';
      fileUI.style.boxShadow = 'none';
      progressInner.style.backgroundColor = '#ed7164';
    });

    xhr.upload.addEventListener('loadend', (e) => {
      loadend++;
      if (counter === loadend) {
        const btnsHolder = document.querySelector('#btns-holder .wrapper');
        const viewBtn = document.getElementById('view-files');
        btnsHolder.style.display = 'flex';
        viewBtn.style.display = 'inline';
      }
    });

    xhr.send(formData);
  }

  function uploadFiles(files) {
    const interface = document.getElementById('upload-interface');
    const table = document.querySelector('table');
    const addFile = document.querySelector('.add-file');
    const btnsHolder = document.querySelector('#btns-holder .wrapper');
    const submitBtn = document.querySelector('#submit');
    interface.style.display = 'block';
    table.style.display = 'none';
    addFile.style.display = 'none';
    btnsHolder.style.display = 'none';
    submitBtn.style.display = 'none';

    for (const item of files) {
      if (item && item.type) {
        const { name, size } = item;
        const id = 'file' + counter;
        const file = new FileUploadUI({ name, size, id });
        interface.append(file.render());
        upload(item, id);
        counter++;
      }
    }
  }
})();
