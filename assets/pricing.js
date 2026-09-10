/* Nawa HR — pricing calculator */
(function(){
  const SETUP_FEE = 150;
  const MONTHLY_TIERS = [
    { max: 5, price: 25 },
    { max: 10, price: 50 },
    { max: 20, price: 100 },
    { max: 40, price: 125 },
    { max: 50, price: 150 }
  ];
  const ONE_TIME_TIERS = [
    { max: 50, price: 599 },
    { max: 100, price: 899 },
    { max: 200, price: 1499 },
    { max: 300, price: 2199 },
    { max: 400, price: 2799 },
    { max: 500, price: 3199 }
  ];

  function monthlyTierPrice(n){
    for(const tier of MONTHLY_TIERS){ if(n <= tier.max) return tier.price; }
    return null; // 50+ -> contact us
  }
  function oneTimePrice(n){
    for(const tier of ONE_TIME_TIERS){ if(n <= tier.max) return tier.price; }
    return null; // 500+ -> contact us
  }

  function formatMoney(v){
    return '$' + v.toLocaleString('en-US');
  }

  const SUB_TICKS = [1, 10, 20, 30, 40, 50];
  const ONCE_TICKS = [1, 100, 200, 300, 400, '500+'];

  function applyModeRange(mode){
    const slider = document.getElementById('empSlider');
    const ticksEl = document.getElementById('rangeTicks');
    const max = mode === 'sub' ? 50 : 500;
    slider.max = String(max);
    if(parseInt(slider.value, 10) > max) slider.value = String(max);
    const ticks = mode === 'sub' ? SUB_TICKS : ONCE_TICKS;
    ticksEl.innerHTML = ticks.map(t => '<span>' + t + '</span>').join('');
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
      const tierPrice = monthlyTierPrice(n);
      if(tierPrice === null){
        priceEl.textContent = lang === 'ar' ? 'تواصل معنا' : 'Contact us';
        unitEl.textContent = '';
        noteEl.textContent = '';
        contactNote.querySelector('span').textContent = dict['pricepage.subnote50'];
        contactNote.style.display = 'flex';
      } else {
        priceEl.textContent = formatMoney(tierPrice + SETUP_FEE);
        unitEl.textContent = ' / ' + dict['pricepage.firstmonth'];
        noteEl.textContent = dict['pricepage.thenmonthly'].replace('{price}', formatMoney(tierPrice));
        contactNote.style.display = 'none';
      }
    } else {
      const p = oneTimePrice(n);
      if(p === null){
        priceEl.textContent = lang === 'ar' ? 'تواصل معنا' : 'Contact us';
        unitEl.textContent = '';
        contactNote.querySelector('span').textContent = dict['pricepage.note'];
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
        applyModeRange(btn.getAttribute('data-mode'));
        update();
      });
    });
    window.onLanguageApplied = update;
    applyModeRange(document.querySelector('.pricing-toggle button.active').getAttribute('data-mode'));
    update();
  });
})();
