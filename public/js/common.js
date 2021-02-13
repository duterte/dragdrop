'use strict';

(function () {
  const collapse = document.querySelectorAll('.collapse');
  const secretInput = document.querySelector('#secret');
  const project = document.querySelector('#assigned-project');

  document.addEventListener('keydown', keydown);
  project.addEventListener('change', selectChangedHandler);
  window.addEventListener('load', load);

  function getLists(secret = '') {
    fetch('/lists', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ secret }),
    })
      .then(res => {
        if (res.status !== 200) {
          throw new Error(`Upload not sucessful status code: ${res.status}`);
        } else {
          return res.json();
        }
      })
      .then((json = []) => {
        if (json.length) {
          project.innerHTML = '';
          const element = document.createElement('option');
          element.innerText = 'select project';
          element.value = '';
          project.append(element);
          for (const item of json) {
            const element2 = document.createElement('option');
            element2.innerText = item;
            element2.value = item;
            project.append(element2);
          }
          project.classList.add('show');
        } else {
          project.innerHTML = '';
          project.classList.remove('show');
        }
      })
      .catch(err => console.log(err));
  }

  function load(e) {
    getLists();
  }

  function selectChangedHandler(e) {
    const secret = e.target.value;
    if (secret) {
      window.location.replace(`/project/get?name=${secret}`);
    }
  }

  function keydown(e) {
    if (e.keyCode === 13 && secretInput.value) {
      getLists(secretInput.value);
    }
  }
  collapse.forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      const element = e.currentTarget.parentElement;
      const content = element.querySelector('.content');
      const svg = element.querySelector('svg');

      if (content.style.display === 'grid') {
        if (svg) svg.classList.remove('down');
        setTimeout(() => (content.style.display = 'none'), 200);
        content.style.maxHeight = 0;
      } else {
        if (svg) svg.classList.add('down');
        content.style.display = 'grid';
        content.style.maxHeight = `${content.scrollHeight}px`;
      }
    });
  });

  document.body.addEventListener('click', () => {
    collapse.forEach(item => {
      const element = item.parentElement;
      const content = element.querySelector('.content');
      const svg = element.querySelector('svg');
      if (content.style.display === 'grid') {
        if (svg) svg.classList.remove('down');
        setTimeout(() => (content.style.display = 'none'), 200);
        content.style.maxHeight = 0;
      }
    });
  });

  document.body.addEventListener('dragover', e => {
    e.preventDefault();
  });

  document.body.addEventListener('drop', e => {
    e.preventDefault();
  });
})();
