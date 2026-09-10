/* Nawa HR — shared site behavior */

/* Theme (light/dark) */
(function initTheme(){
  let saved = null;
  try{ saved = localStorage.getItem('nawa-theme'); }catch(e){}
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  if(theme === 'dark') document.documentElement.classList.add('dark');
})();

function toggleTheme(){
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  try{ localStorage.setItem('nawa-theme', isDark ? 'dark' : 'light'); }catch(e){}
}

document.addEventListener('DOMContentLoaded', function(){
  const themeBtn = document.getElementById('themeToggle');
  if(themeBtn) themeBtn.addEventListener('click', toggleTheme);

  const langButtons = document.querySelectorAll('.lang-switch button');
  langButtons.forEach(btn=>{
    btn.addEventListener('click', ()=> applyLanguage(btn.getAttribute('data-lang')));
  });

  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if(navToggle && mainNav){
    navToggle.addEventListener('click', ()=> mainNav.classList.toggle('open'));
    mainNav.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> mainNav.classList.remove('open')));
  }

  document.querySelectorAll('.faq-item .faq-q').forEach(q=>{
    q.addEventListener('click', ()=>{
      const item = q.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i=> i.classList.remove('open'));
      if(!wasOpen) item.classList.add('open');
    });
  });

  const contactForm = document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      const note = document.getElementById('formSent');
      if(note) note.style.display = 'block';
      contactForm.reset();
    });
  }
});
