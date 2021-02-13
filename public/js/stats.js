'use strict';

(function () {
  const beta = document.querySelector('#submit-beta');
  const live = document.querySelector('#submit-live');

  beta.addEventListener('click', upload);
  live.addEventListener('click', upload);

  function activateSpinner() {
    const pop = document.querySelector('#pop');
    const spinnerIcon = document.querySelector('.spinner-icon');
    pop.style.display = 'grid';
  }

  function upload() {
    activateSpinner();
  }
})();
