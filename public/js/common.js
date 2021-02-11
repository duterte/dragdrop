'use strict';

(function () {
  const collapse = document.querySelectorAll('.collapse');
  const secretInput = document.querySelector('#secret');
  const project = document.querySelector('#assigned-project');

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
