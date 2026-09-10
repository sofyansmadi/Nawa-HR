/* Nawa HR — pricing calculator */
(function(){
  const PER_EMPLOYEE_MONTHLY = 2.5;
  const MONTHLY_FLOOR = 49;
  const ONE_TIME_TIERS = [
    { max: 20, price: 999 },
    { max: 50, price: 1999 },
    { max: 100, price: 3499 },
    { max: 250, price: 5999 },
    { max: 500, price: 9999 }
  ];

  function monthlyPrice(n){
    return Math.max(MONTHLY_FLOOR, Math.round(n * PER_EMPLOYEE_MONTHLY));
  }
  function oneTimePrice(n){
    for(const tier of ONE_TIME_TIERS){ if(n <= tier.max) return tier.price; }
    return null; // 500+ -> contact us
  }

  function formatMoney(v){
    return '$' + v.toLocaleString('en-US');
  }

  function update(){
    const slider = document.getElementById('empSlider');
    const mode = document.querySelector('.pricing-toggle button.active').getAttribute('data-mode');
    const n = parseInt(slider.value, 10);
    document.getElementById('empCount').textContent = n >= 500 ? '500+' : n;

    const priceEl = document.getElementById('priceValue');
    const unitEl = document.getElementById('priceUnit');
    const noteEl = document.getElementById('priceNote');
    const contactNote = document.getElementById('contactUsNote');
    const lang = document.documentElement.getAttribute('lang') || 'ar';
    const dict = translations[lang];

    if(mode === 'sub'){
      priceEl.textContent = formatMoney(monthlyPrice(n));
      unitEl.textContent = ' / ' + dict['pricepage.permonth'];
      noteEl.textContent = dict['pricepage.subnote'];
      contactNote.style.display = 'none';
    } else {
      const p = oneTimePrice(n);
      if(p === null){
        priceEl.textContent = lang === 'ar' ? 'تواصل معنا' : 'Contact us';
        unitEl.textContent = '';
        contactNote.style.display = 'flex';
      } else {
        priceEl.textContent = formatMoney(p);
        unitEl.textContent = ' ' + dict['pricepage.onetime'];
        contactNote.style.display = 'none';
      }
      noteEl.textContent = dict['pricepage.oncenote'];
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    const slider = document.getElementById('empSlider');
    if(!slider) return;
    slider.addEventListener('input', update);
    document.querySelectorAll('.pricing-toggle button').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        document.querySelectorAll('.pricing-toggle button').forEach(b=> b.classList.remove('active'));
        btn.classList.add('active');
        update();
      });
    });
    window.onLanguageApplied = update;
    update();
  });
})();
