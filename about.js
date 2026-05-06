const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.problem-card, .solution-item').forEach((el, i) => {
  el.style.transitionDelay = (i * 0.09) + 's';
  observer.observe(el);
});
