/**
 * Builds Meta Pixel HTML snippets for the Unbound website.
 * Pixel ID: 974624348861709
 *
 * Base code goes in <head> — fires PageView automatically on load.
 * Event snippets go before </body> and fire specific events.
 */

const PIXEL_ID = '974624348861709';

/** Base snippet — place in <head>. Fires PageView automatically. */
function baseSnippet() {
  return `<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1"/></noscript>`;
}

/**
 * Returns the HTML string for a Lead event snippet.
 * Call fireLead() client-side after a successful signup.
 */
function leadSnippet() {
  return `fbq('track', 'Lead');`;
}

/**
 * Returns the HTML string for a Purchase event snippet.
 * @param {number} amountCents — payment amount in cents (e.g. 12700 for $127)
 * @param {string} currency — ISO 4217 currency code (e.g. 'USD')
 * @param {string} tier — 'full' or 'premium'
 */
function purchaseSnippet(amountCents, currency, tier) {
  const amount = (amountCents / 100).toFixed(2);
  return `<script>
fbq('track', 'Purchase', {
  value: ${amount},
  currency: '${currency}',
  content_ids: ['unbound_${tier}'],
  content_type: 'product',
});
</script>`;
}

module.exports = { PIXEL_ID, baseSnippet, leadSnippet, purchaseSnippet };