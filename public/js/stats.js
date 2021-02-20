'use strict';

(function () {
  const beta = document.querySelector('#submit-beta');
  const live = document.querySelector('#submit-live');

  if(beta) {
    beta.addEventListener('click', () => activateSpinner());
  }
  if(live){
    live.addEventListener('click', () => activateSpinner());
  }

  function activateSpinner() {
    const pop = document.querySelector('#pop');
    pop.style.display = 'grid';
  }
})();
