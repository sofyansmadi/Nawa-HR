/* Nawa HR — PayPal configuration
   Fill in your real values here once you have them. Nothing in this file
   is secret — the Client ID and Plan IDs are meant to be public and safe
   to ship in front-end code. Never put your PayPal "Secret" key here or
   anywhere in this site's code.
*/
const PAYPAL_CONFIG = {
  // From developer.paypal.com -> Apps & Credentials -> your app -> Client ID.
  // Use the SANDBOX client ID first to test, then switch to the LIVE one.
  clientId: "BAAEH1jRappCZUGAdQSObwI9ez03H1R4rxcBOCs7-srb8eqPS_f8k9N1iT7qXPkVFEE7Zd7WMGgfgg30UI",

  // From your PayPal Business account -> Pay & Get Paid -> Subscriptions.
  // Create one plan per monthly tier below, each with:
  //   - the tier's regular monthly price
  //   - a one-time "setup fee" of $150
  // then paste the Plan ID (looks like "P-XXXXXXXXXXXXXXXXXXXXX") here.
  subscriptionPlans: {
    tier5:  "P-56R155059M452771FNKSYBQQ", // up to 5 employees   — $25/mo + $150 setup
    tier10: "P-3A239857DH321131KNKSYEUI", // 5-10 employees      — $50/mo + $150 setup
    tier20: "PLAN_ID_TIER_20",  // 10-20 employees     — $100/mo + $150 setup
    tier40: "PLAN_ID_TIER_40",  // 20-40 employees     — $125/mo + $150 setup
    tier50: "PLAN_ID_TIER_50"   // 40-50 employees     — $150/mo + $150 setup
  }
};
