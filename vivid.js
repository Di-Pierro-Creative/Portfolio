/* Di Pierro Creative: shared colour + motion layer (see vivid.css). */
(function () {
  'use strict';
  var d = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) d.classList.add('vv-anim');

  /* 1. Brand mark in the nav: lilac circle + cyan triangle, overlap in charcoal */
  var MARK = '<svg class="vv-mark" viewBox="0 0 30 30" aria-hidden="true" focusable="false">' +
    '<defs><clipPath id="vvMarkClip"><circle cx="12" cy="13" r="10"/></clipPath></defs>' +
    '<g class="vv-mc"><circle cx="12" cy="13" r="10" fill="#C9B6FF"/></g>' +
    '<g class="vv-mt"><polygon points="17,6 29,28 7,28" fill="#00C2D1"/></g>' +
    '<polygon points="17,6 29,28 7,28" fill="#1A1D21" clip-path="url(#vvMarkClip)"/></svg>';
  var brand = document.querySelector('nav .logo');
  if (!brand) {
    var first = document.querySelector('nav > a:first-child');
    if (first && /di pierro/i.test(first.textContent)) {
      first.textContent = first.textContent.replace(/^\s*←\s*/, '');
      first.classList.add('vv-brand');
      first.parentNode.classList.add('vv-nav');
      brand = first;
    }
  }
  if (brand && !brand.querySelector('.vv-mark')) brand.insertAdjacentHTML('afterbegin', MARK);

  /* 2. Shapes in the top of the page */
  var hero = document.querySelector('.svc-hero') || document.querySelector('header.hero .wrap') ||
             document.querySelector('nav ~ .hero') || document.querySelector('nav ~ header');
  var art = null;
  if (hero && !hero.querySelector('.vv-art')) {
    hero.classList.add('vv-hero');
    if (hero.matches('.svc-hero, div.hero') && hero.children.length >= 2) hero.classList.add('vv-hero--card');
    hero.insertAdjacentHTML('beforeend',
      '<svg class="vv-art" viewBox="0 0 330 300" aria-hidden="true" focusable="false">' +
      '<defs><clipPath id="vvArtClip"><circle cx="128" cy="150" r="104"/></clipPath>' +
      '<pattern id="vvArtDots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1.8" fill="#1A1D21"/></pattern></defs>' +
      '<circle cx="128" cy="150" r="104" fill="#C9B6FF"/>' +
      '<polygon points="200,58 314,292 86,292" fill="#00C2D1"/>' +
      '<g clip-path="url(#vvArtClip)"><polygon points="200,58 314,292 86,292" fill="#B6E9EE"/><polygon points="200,58 314,292 86,292" fill="url(#vvArtDots)"/></g>' +
      '<circle class="vv-orbit" cx="292" cy="44" r="20" fill="none" stroke="#1A1D21" stroke-width="2.5" stroke-dasharray="5 7"/>' +
      '</svg>');
    art = hero.querySelector('.vv-art');
  }

  /* gentle pointer parallax on the shapes (mouse only) */
  if (art && !reduce && window.matchMedia && matchMedia('(pointer: fine)').matches) {
    var raf = 0, tx = 0, ty = 0;
    window.addEventListener('pointermove', function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 18;
      ty = (e.clientY / window.innerHeight - 0.5) * 14;
      if (!raf) raf = requestAnimationFrame(function () {
        raf = 0;
        art.style.setProperty('--px', tx.toFixed(1) + 'px');
        art.style.setProperty('--py', ty.toFixed(1) + 'px');
      });
    }, { passive: true });
  }

  /* 3. Shapes on the section labels */
  [].forEach.call(document.querySelectorAll('.sec-label'), function (el, i) { el.classList.add('vv-g' + (i % 3)); });

  /* 4. Stripe before the footer (or before the home contact band) */
  var anchor = document.querySelector('section.contact') || document.querySelector('body > footer, footer');
  if (anchor && !document.querySelector('.vv-stripe')) {
    anchor.insertAdjacentHTML('beforebegin', '<div class="vv-stripe" aria-hidden="true"><i></i><i></i><i></i></div>');
  }

  /* 5. Count-up for numbers marked with data-count, e.g. "2,598", "87%" */
  function countUp(el) {
    if (el.getAttribute('data-counted')) return;
    el.setAttribute('data-counted', '1');
    var raw = el.getAttribute('data-count-text') || el.textContent.trim();
    el.setAttribute('data-count-text', raw);
    var m = raw.match(/^([^\d]*)([\d.,]+)(.*)$/);
    if (!m) return;
    var digits = m[2].replace(/[.,]/g, ''), target = parseInt(digits, 10);
    var sep = (m[2].match(/[.,]/) || [''])[0];
    var fmt = function (n) { var s = String(n); return sep ? s.replace(/\B(?=(\d{3})+(?!\d))/g, sep) : s; };
    var t0 = null, dur = 1200;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1); p = 1 - Math.pow(1 - p, 3);
      el.textContent = m[1] + fmt(Math.round(target * p)) + m[3];
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (reduce || !('IntersectionObserver' in window)) return;   // final states only

  /* 6. Reveal on scroll, staggered among siblings */
  var SEL = ['main h2', 'section h2', '.sec-label', '.tease', '.why', '.svc', '.kit', '.cycle', '.card', '.colcard',
             '.step', '.p', '.sys', '.inc', '.define', '.thesis', '.proof', '.callout', '.answer', '.about-facts',
             'details', '.st', '.samples > *', '.related', '.diag', '.statement'].join(',');
  var skip = function (el) { return el.closest('nav, header.hero, .svc-hero, #dpc-intro, .loop, .sx-a, .cs-frame, [data-vv-skip]'); };
  var items = [].filter.call(document.querySelectorAll(SEL), function (el) {
    if (skip(el)) return false;
    var r = el.getBoundingClientRect();
    return r.top > window.innerHeight * 0.9;            // only what starts below the fold
  });
  items = items.filter(function (el) { return !items.some(function (o) { return o !== el && o.contains(el); }); });
  items.forEach(function (el) {
    var sib = 0, p = el.previousElementSibling;
    while (p && sib < 5) { if (items.indexOf(p) > -1) sib++; p = p.previousElementSibling; }
    el.style.setProperty('--vv-d', (sib * 0.08) + 's');
    el.classList.add('vv-r');
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; io.unobserve(el);
      el.classList.add('vv-in');
      if (el.classList.contains('vv-r')) {
        // hand the element back to its own styles (hover lifts etc.) once it has arrived
        setTimeout(function () { el.classList.remove('vv-r', 'vv-in'); el.style.removeProperty('--vv-d'); }, 1300);
      }
      [].forEach.call(el.matches('[data-count]') ? [el] : el.querySelectorAll('[data-count]'), countUp);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  items.forEach(function (el) { io.observe(el); });
  [].forEach.call(document.querySelectorAll('.rule, .vv-stripe, [data-count]'), function (el) { io.observe(el); });
})();
