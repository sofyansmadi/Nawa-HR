/* Nawa HR — pricing (flat one-time price + currency display) */
(function(){
  const PRICE_USD = 1400;

  /* Approximate rates for display only — actual payment is always charged in USD via PayPal. */
  const RATES = {
    USD: { rate: 1,      symbol: '$',   decimals: 0 },
    JOD: { rate: 0.709,  symbol: 'د.أ', decimals: 0 },
    SAR: { rate: 3.75,   symbol: 'ر.س', decimals: 0 },
    AED: { rate: 3.6725, symbol: 'د.إ', decimals: 0 },
    EGP: { rate: 49,     symbol: 'ج.م', decimals: 0 }
  };

  function formatMoney(v, cur){
    const info = RATES[cur];
    const n = Math.round(v * info.rate).toLocaleString('en-US');
    return cur === 'USD' ? '$' + n : n + ' ' + info.symbol;
  }

  function updatePrice(){
    const active = document.querySelector('#currencyRow button.active');
    const cur = active ? active.getAttribute('data-cur') : 'USD';
    const priceEl = document.getElementById('priceValue');
    if(priceEl) priceEl.textContent = formatMoney(PRICE_USD, cur);
  }

  /* ---- PayPal ---- */
  let onetimeReady = false;
  let onetimeQueue = [];

  function paypalConfigured(){
    return typeof PAYPAL_CONFIG !== 'undefined' && PAYPAL_CONFIG.clientId && PAYPAL_CONFIG.clientId !== 'YOUR_PAYPAL_CLIENT_ID';
  }

  function loadPaypalSdk(){
    if(!paypalConfigured()) return;
    const s = document.createElement('script');
    s.src = 'https://www.paypal.com/sdk/js?client-id=' + encodeURIComponent(PAYPAL_CONFIG.clientId) + '&currency=USD&components=buttons&intent=capture';
    s.setAttribute('data-namespace', 'paypal_onetime');
    s.onload = function(){ onetimeReady = true; onetimeQueue.forEach(fn => fn()); onetimeQueue = []; };
    document.head.appendChild(s);
  }

  function renderPaymentButton(){
    if(!paypalConfigured()) return;
    const container = document.getElementById('paypalButtons');
    if(!container) return;
    container.innerHTML = '';
    const doRender = function(){
      window.paypal_onetime.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay' },
        createOrder: function(data, actions){
          return actions.order.create({
            purchase_units: [{
              amount: { value: String(PRICE_USD) },
              description: 'Nawa HR — one-time license'
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

  document.addEventListener('DOMContentLoaded', function(){
    const currencyRow = document.getElementById('currencyRow');
    if(!currencyRow) return;
    currencyRow.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        currencyRow.querySelectorAll('button').forEach(b=> b.classList.remove('active'));
        btn.classList.add('active');
        updatePrice();
      });
    });
    window.onLanguageApplied = updatePrice;
    updatePrice();
    loadPaypalSdk();
    renderPaymentButton();
  });
})();
