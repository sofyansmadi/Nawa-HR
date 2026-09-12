/* Nawa HR — pricing calculator */
(function(){
  const SETUP_FEE = 150;
  const MONTHLY_TIERS = [
    { max: 5, price: 25, planKey: 'tier5' },
    { max: 10, price: 50, planKey: 'tier10' },
    { max: 20, price: 100, planKey: 'tier20' },
    { max: 40, price: 125, planKey: 'tier40' },
    { max: 50, price: 150, planKey: 'tier50' }
  ];
  const ONE_TIME_TIERS = [
    { max: 50, price: 599 },
    { max: 100, price: 899 },
    { max: 200, price: 1499 },
    { max: 300, price: 2199 },
    { max: 400, price: 2799 },
    { max: 500, price: 3199 }
  ];

  function monthlyTier(n){
    for(const tier of MONTHLY_TIERS){ if(n <= tier.max) return tier; }
    return null; // 50+ -> contact us
  }
  function monthlyTierPrice(n){
    const tier = monthlyTier(n);
    return tier ? tier.price : null;
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

    syncPaymentVisibility(mode, n);
  }

  function syncPaymentVisibility(mode, n){
    const paymentArea = document.getElementById('paymentArea');
    const contactCta = document.getElementById('contactCta');
    if(!paymentArea) return;
    const price = mode === 'sub' ? monthlyTierPrice(n) : oneTimePrice(n);
    paymentArea.style.display = price === null ? 'none' : 'block';
    contactCta.style.display = price === null ? 'block' : 'none';
  }

  /* ---- PayPal ---- */
  let onetimeReady = false;
  let subscribeReady = false;
  let onetimeQueue = [];
  let subscribeQueue = [];

  function paypalConfigured(){
    return typeof PAYPAL_CONFIG !== 'undefined' && PAYPAL_CONFIG.clientId && PAYPAL_CONFIG.clientId !== 'YOUR_PAYPAL_CLIENT_ID';
  }

  function loadPaypalSdks(){
    if(!paypalConfigured()) return;
    const base = 'https://www.paypal.com/sdk/js?client-id=' + encodeURIComponent(PAYPAL_CONFIG.clientId) + '&currency=USD&components=buttons';

    const s1 = document.createElement('script');
    s1.src = base + '&intent=capture';
    s1.setAttribute('data-namespace', 'paypal_onetime');
    s1.onload = function(){ onetimeReady = true; onetimeQueue.forEach(fn => fn()); onetimeQueue = []; };
    document.head.appendChild(s1);

    const s2 = document.createElement('script');
    s2.src = base + '&intent=subscription&vault=true';
    s2.setAttribute('data-namespace', 'paypal_subscribe');
    s2.onload = function(){ subscribeReady = true; subscribeQueue.forEach(fn => fn()); subscribeQueue = []; };
    document.head.appendChild(s2);
  }

  function renderPaymentButtons(){
    if(!paypalConfigured()) return;
    const slider = document.getElementById('empSlider');
    const mode = document.querySelector('.pricing-toggle button.active').getAttribute('data-mode');
    const n = parseInt(slider.value, 10);
    const container = document.getElementById('paypalButtons');
    if(!container) return;
    container.innerHTML = '';

    if(mode === 'sub'){
      const tier = monthlyTier(n);
      if(!tier) return;
      const planId = PAYPAL_CONFIG.subscriptionPlans[tier.planKey];
      const doRender = function(){
        window.paypal_subscribe.Buttons({
          style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'subscribe' },
          createSubscription: function(data, actions){
            return actions.subscription.create({ plan_id: planId });
          },
          onApprove: function(data){
            window.location.href = '../thank-you/?sub=' + encodeURIComponent(data.subscriptionID || '');
          }
        }).render('#paypalButtons');
      };
      if(subscribeReady) doRender(); else subscribeQueue.push(doRender);
    } else {
      const price = oneTimePrice(n);
      if(price === null) return;
      const doRender = function(){
        window.paypal_onetime.Buttons({
          style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay' },
          createOrder: function(data, actions){
            return actions.order.create({
              purchase_units: [{
                amount: { value: String(price) },
                description: 'Nawa HR — one-time license (' + n + ' employees)'
              }]
            });
          },
          onApprove: function(data, actions){
            return actions.order.capture().then(function(details){
              window.location.href = '../thank-you/?order=' + encodeURIComponent(details.id || '');
            });
          }
        }).render('#paypalButtons');
      };
      if(onetimeReady) doRender(); else onetimeQueue.push(doRender);
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    const slider = document.getElementById('empSlider');
    if(!slider) return;
    slider.addEventListener('input', update);
    slider.addEventListener('change', renderPaymentButtons);
    document.querySelectorAll('.pricing-toggle button').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        document.querySelectorAll('.pricing-toggle button').forEach(b=> b.classList.remove('active'));
        btn.classList.add('active');
        applyModeRange(btn.getAttribute('data-mode'));
        update();
        renderPaymentButtons();
      });
    });
    window.onLanguageApplied = update;
    applyModeRange(document.querySelector('.pricing-toggle button.active').getAttribute('data-mode'));
    update();
    loadPaypalSdks();
    renderPaymentButtons();
  });
})();
