document.addEventListener('DOMContentLoaded', () => {
  const page = location.pathname.split('/').pop() || 'index.html';
  const link = (href, text) => `<a href="${href}" ${page === href ? 'aria-current="page"' : ''}>${text}</a>`;
  document.querySelector('[data-header]').innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="announce">An independent point of view. <span>First collection in the making.</span></div>
    <header class="site-header"><div class="wrap nav">
      <a class="brand" href="index.html" aria-label="LOOM home">LOOM<span class="brand-dot" aria-hidden="true">✳</span></a>
      <nav class="nav-links" aria-label="Main navigation">${link('shop.html', 'The collection')}${link('index.html#perspective', 'Our perspective')}${link('fit.html', 'Fit notes')}</nav>
      <a class="cart-pill" href="cart.html" ${page === 'cart.html' ? 'aria-current="page"' : ''}>Bag <span class="bag-count" data-cart-count>0</span></a>
    </div></header>`;
  document.querySelector('[data-footer]').innerHTML = `
    <footer class="site-footer"><div class="wrap footer-top"><div><p class="eyebrow">A wardrobe. Your way.</p><h2>Make room<br>for yourself.</h2></div>
    <nav aria-label="Footer navigation"><a href="shop.html">The collection ↗</a><a href="fit.html">Fit & measurements ↗</a><a href="care.html">Customer care ↗</a><a href="track.html">Order status ↗</a></nav></div>
    <div class="wrap footer-bottom"><span>© ${new Date().getFullYear()} LOOM</span><span>Collection preview · Orders are not open</span><a href="index.html">Back to the beginning ↑</a></div><div class="footer-wordmark" aria-hidden="true">LOOM</div></footer>`;
});
