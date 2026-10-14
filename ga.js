/*
 * Google Analytics 4 — Di Pierro Creative
 *
 * Para ativar: troque G-XXXXXXXXXX abaixo pelo ID de medição do GA4
 * (GA4 → Administrador → Fluxos de dados → Web → "ID da métrica", começa com G-).
 * Enquanto o ID for o de exemplo, nada é enviado.
 *
 * Eventos enviados:
 *  - generate_lead  → clique em qualquer link de WhatsApp (method: whatsapp) ou e-mail (method: email),
 *                     com o serviço de origem (service) quando o clique vem da seção de serviços.
 *                     Marque "generate_lead" como evento principal (key event) no GA4.
 *  - select_content → qual problema o visitante abriu na seção de serviços (item_id = serviço).
 *  - click_linkedin → clique no LinkedIn.
 */
(function () {
  var GA_ID = 'G-XXXXXXXXXX';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  var active = /^G-[A-Z0-9]{6,}$/.test(GA_ID) && GA_ID !== 'G-XXXXXXXXXX';
  if (!active) { return; }

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);
  gtag('js', new Date());
  gtag('config', GA_ID);

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) { return; }
    var href = a.getAttribute('href') || '';
    var service = a.getAttribute('data-service') || 'geral';
    var base = { service: service, link_text: (a.textContent || '').trim().slice(0, 80), page_path: location.pathname };
    if (/wa\.me|api\.whatsapp\.com/.test(href)) {
      gtag('event', 'generate_lead', Object.assign({ method: 'whatsapp' }, base));
    } else if (href.indexOf('mailto:') === 0) {
      gtag('event', 'generate_lead', Object.assign({ method: 'email' }, base));
    } else if (/linkedin\.com/.test(href)) {
      gtag('event', 'click_linkedin', base);
    }
  }, true);
})();
