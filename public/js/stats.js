'use strict';

(function () {
  const beta = document.querySelector('#submit-beta');
  const live = document.querySelector('#submit-live');

  beta.addEventListener('click', () => activateSpinner());
  live.addEventListener('click', () => activateSpinner());

  function activateSpinner() {
    const pop = document.querySelector('#pop');
    pop.style.display = 'grid';
  }
})();
