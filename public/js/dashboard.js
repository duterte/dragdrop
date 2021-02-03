const projectBox = document.querySelectorAll('.project-box');

projectBox.forEach(item => {
  item.addEventListener('click', () => {
    window.location.replace('/upload');
  });
});
