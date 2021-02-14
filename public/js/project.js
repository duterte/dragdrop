'strict mode';

(function () {
  const fileInput = document.querySelector('input[type="file"]');
  const uploadBtn1 = document.querySelector('#upload-btn1');
  const dropzone = document.querySelector('#dropzone');
  const submit = document.querySelector('#submit');
  const body = document.body;

  // event listeners
  body.addEventListener('drop', e => uploadFiles(e.dataTransfer.files));
  body.addEventListener('dragover', e => dropzone.classList.add('show'));
  dropzone.addEventListener('dragleave', e =>
    dropzone.classList.remove('show')
  );
  uploadBtn1.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', e => uploadFiles(e.currentTarget.files));
  submit.addEventListener('click', () => activateSpinner());

  function uploadFiles(files) {
    const body = new FormData();
    let i = 0;
    for (const item of files) {
      if (item && item.type) {
        body.append(`file${i}`, item);
        i++;
      }
    }
    const pop = document.querySelector('#pop');
    pop.style.display = 'grid';
    fetch('/project', { method: 'post', body })
      .then(res => {
        if (res.status !== 200) {
          throw new Error(`Upload failed status code: ${res.status}`);
        } else {
          window.location.reload();
        }
      })
      .catch(err => console.log(err));
  }
})();
