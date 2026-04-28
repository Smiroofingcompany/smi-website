(function () {
  if (window.SMIInstantInspectionWidgetLoaded) return;
  window.SMIInstantInspectionWidgetLoaded = true;

  var PHONE_DISPLAY = '(501) 464-5139';
  var PHONE_TEL = 'tel:+15014645139';
  var ENDPOINT = '/api/contact';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function escapeHTML(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }

  function detectContext() {
    var path = window.location.pathname.replace(/^\/|\/$/g, '');
    var parts = path ? path.split('/') : [];
    var title = document.title || 'SMI Roofing';
    var service = 'Free Roof Inspection';
    var location = '';

    if (parts[0] === 'commercial-roofing') {
      service = 'Commercial Roof Inspection';
      if (parts[1]) location = parts[1].replace(/-ar$/, '').replace(/-/g, ' ');
    } else if (parts[0] === 'service-areas' && parts[1]) {
      location = parts[1].replace(/-ar$/, '').replace(/-/g, ' ');
    } else if (parts.length > 1) {
      location = parts[0].replace(/-/g, ' ');
      service = parts[1].replace(/-/g, ' ');
    } else if (parts[0]) {
      service = parts[0].replace(/-/g, ' ');
    }

    return {
      title: title,
      service: service.replace(/\b\w/g, function (c) { return c.toUpperCase(); }),
      location: location.replace(/\b\w/g, function (c) { return c.toUpperCase(); })
    };
  }

  ready(function () {
    var context = detectContext();
    var host = document.createElement('div');
    host.id = 'smi-instant-inspection-widget';
    document.body.appendChild(host);

    var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
    root.innerHTML = ''
      + '<style>'
      + ':host{all:initial;display:block;position:fixed;right:18px;bottom:18px;z-index:2147483000;font-family:"Plus Jakarta Sans",Arial,sans-serif;color:#111827}'
      + '*,*::before,*::after{box-sizing:border-box}'
      + 'button,input,select{font:inherit}'
      + '.iqw-wrap{width:min(380px,calc(100vw - 28px));line-height:1.35}'
      + '.iqw-launcher{width:100%;min-height:72px;display:flex;align-items:center;gap:14px;padding:14px 16px;border:1px solid rgba(0,200,240,.42);border-radius:10px;background:#0a1628;color:#fff;box-shadow:0 18px 50px rgba(10,22,40,.28);cursor:pointer;text-align:left}'
      + '.iqw-launcher:focus-visible,.iqw-close:focus-visible,.iqw-next:focus-visible,.iqw-back:focus-visible,.iqw-choice:focus-visible,.iqw-call:focus-visible{outline:3px solid rgba(0,200,240,.35);outline-offset:2px}'
      + '.iqw-mark{width:42px;height:42px;border-radius:9px;background:#00C8F0;color:#06131d;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;flex:0 0 auto}'
      + '.iqw-launcher-copy{display:block;min-width:0}'
      + '.iqw-launcher-copy span{display:block;color:#8beaff;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.12em}'
      + '.iqw-launcher-copy strong{display:block;margin-top:3px;font-size:15px;font-weight:900;letter-spacing:0}'
      + '.iqw-panel{display:none;margin-bottom:12px;overflow:hidden;border:1px solid #dce3eb;border-top:4px solid #00C8F0;border-radius:10px;background:#fff;box-shadow:0 24px 70px rgba(10,22,40,.25)}'
      + '.iqw-open .iqw-panel{display:block}'
      + '.iqw-open .iqw-launcher{display:none}'
      + '.iqw-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:18px 18px 12px;border-bottom:1px solid #eef2f6}'
      + '.iqw-eyebrow{margin:0 0 5px;color:#00a5c7;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.13em}'
      + '.iqw-title{margin:0;color:#111827;font-size:20px;font-weight:900;line-height:1.08;font-family:"Outfit","Plus Jakarta Sans",Arial,sans-serif}'
      + '.iqw-sub{margin:7px 0 0;color:#59677a;font-size:13px;font-weight:700;line-height:1.45}'
      + '.iqw-close{width:34px;height:34px;border:1px solid #dce3eb;border-radius:7px;background:#fff;color:#111827;font-size:22px;line-height:1;cursor:pointer;flex:0 0 auto}'
      + '.iqw-progress{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:14px 18px 0}'
      + '.iqw-dot{height:5px;border-radius:99px;background:#e8eef4;overflow:hidden}'
      + '.iqw-dot.active{background:#00C8F0}'
      + '.iqw-form{padding:18px}'
      + '.iqw-step{display:none}'
      + '.iqw-step.active{display:block}'
      + '.iqw-label{display:block;margin:0 0 7px;color:#243449;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}'
      + '.iqw-input,.iqw-select{width:100%;height:48px;border:1px solid #d4dbe3;border-radius:7px;background:#fff;color:#111827;padding:0 13px;outline:none;font-size:14px;font-weight:800}'
      + '.iqw-input:focus,.iqw-select:focus{border-color:#00C8F0;box-shadow:0 0 0 4px rgba(0,200,240,.12)}'
      + '.iqw-field{margin-top:14px}'
      + '.iqw-field:first-child{margin-top:0}'
      + '.iqw-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}'
      + '.iqw-choice{min-height:58px;border:1px solid #dce3eb;border-radius:7px;background:#f8fafc;color:#111827;padding:10px;text-align:left;font-size:13px;font-weight:900;cursor:pointer}'
      + '.iqw-choice.active{border-color:#00C8F0;background:#eafaff;box-shadow:0 10px 22px rgba(0,200,240,.12)}'
      + '.iqw-choice small{display:block;margin-top:4px;color:#59677a;font-size:11px;font-weight:800;line-height:1.3}'
      + '.iqw-actions{display:flex;gap:10px;margin-top:16px}'
      + '.iqw-next,.iqw-back,.iqw-call{display:inline-flex;align-items:center;justify-content:center;min-height:46px;border-radius:7px;text-decoration:none;font-size:14px;font-weight:900;cursor:pointer}'
      + '.iqw-next{flex:1;border:0;background:#00C8F0;color:#06131d;box-shadow:0 12px 30px rgba(0,200,240,.22)}'
      + '.iqw-next[disabled]{opacity:.6;cursor:not-allowed}'
      + '.iqw-back{width:94px;border:1px solid #dce3eb;background:#fff;color:#111827}'
      + '.iqw-call{flex:1;border:1px solid #dce3eb;background:#fff;color:#111827}'
      + '.iqw-note{margin:12px 0 0;color:#59677a;font-size:12px;font-weight:700;line-height:1.45}'
      + '.iqw-error{display:none;margin:12px 0 0;color:#a51d2d;font-size:12px;font-weight:900}'
      + '.iqw-error.show{display:block}'
      + '.iqw-consent{display:flex;gap:9px;align-items:flex-start;margin-top:14px;color:#59677a;font-size:11px;font-weight:700;line-height:1.42}'
      + '.iqw-consent input{width:17px;height:17px;margin-top:1px;accent-color:#00C8F0;flex:0 0 auto}'
      + '.iqw-consent a{color:#00a5c7;font-weight:900}'
      + '.iqw-success{display:none;padding:22px 18px 20px;text-align:center}'
      + '.iqw-success.show{display:block}'
      + '.iqw-success b{display:block;color:#111827;font-family:"Outfit","Plus Jakarta Sans",Arial,sans-serif;font-size:24px;font-weight:900}'
      + '.iqw-success p{margin:10px auto 0;color:#59677a;font-size:14px;font-weight:700;line-height:1.55;max-width:300px}'
      + '.iqw-success .iqw-call{margin-top:16px}'
      + '@media(max-width:620px){:host{left:14px;right:14px;bottom:14px}.iqw-wrap{width:100%}.iqw-panel{max-height:calc(100vh - 28px);overflow:auto}.iqw-launcher{min-height:64px}.iqw-grid{grid-template-columns:1fr}.iqw-actions{flex-wrap:wrap}.iqw-back{width:100%}}'
      + '</style>'
      + '<div class="iqw-wrap" data-step="1">'
      + '  <div class="iqw-panel" role="dialog" aria-label="Instant roof inspection request">'
      + '    <div class="iqw-head">'
      + '      <div><p class="iqw-eyebrow">Instant inspection</p><h2 class="iqw-title">Get a roof answer in 3 steps.</h2><p class="iqw-sub">' + escapeHTML(context.location ? context.location + ' roof help' : context.service) + '</p></div>'
      + '      <button class="iqw-close" type="button" aria-label="Close instant inspection widget">&times;</button>'
      + '    </div>'
      + '    <div class="iqw-progress" aria-hidden="true"><span class="iqw-dot active"></span><span class="iqw-dot"></span><span class="iqw-dot"></span></div>'
      + '    <form class="iqw-form" novalidate>'
      + '      <section class="iqw-step active" data-step="1">'
      + '        <div class="iqw-field"><label class="iqw-label" for="iqw-address">Roof address</label><input class="iqw-input" id="iqw-address" name="address" autocomplete="street-address" placeholder="123 Main St, Russellville, AR" required></div>'
      + '        <div class="iqw-field"><label class="iqw-label" for="iqw-timeline">How soon do you need help?</label><select class="iqw-select" id="iqw-timeline" name="timeline"><option value="This week">This week</option><option value="Active leak or storm damage">Active leak or storm damage</option><option value="Planning a replacement">Planning a replacement</option><option value="Just need an inspection">Just need an inspection</option></select></div>'
      + '        <p class="iqw-error" data-error="1">Enter the roof address so SMI can route the request.</p>'
      + '      </section>'
      + '      <section class="iqw-step" data-step="2">'
      + '        <label class="iqw-label">What should SMI inspect?</label>'
      + '        <div class="iqw-grid">'
      + '          <button class="iqw-choice" type="button" data-service="Roof Repair">Roof repair<small>Leak, flashing, shingles</small></button>'
      + '          <button class="iqw-choice" type="button" data-service="Storm Damage">Storm damage<small>Hail, wind, insurance</small></button>'
      + '          <button class="iqw-choice" type="button" data-service="Roof Replacement">Replacement<small>Age, cost, full roof</small></button>'
      + '          <button class="iqw-choice" type="button" data-service="Metal Roofing">Metal roof<small>Standing seam or panels</small></button>'
      + '          <button class="iqw-choice" type="button" data-service="Commercial Roofing">Commercial roof<small>TPO, coatings, repair</small></button>'
      + '          <button class="iqw-choice" type="button" data-service="Free Inspection">Not sure<small>Start with photos</small></button>'
      + '        </div>'
      + '        <p class="iqw-error" data-error="2">Choose the roof issue before continuing.</p>'
      + '      </section>'
      + '      <section class="iqw-step" data-step="3">'
      + '        <div class="iqw-field"><label class="iqw-label" for="iqw-name">Name</label><input class="iqw-input" id="iqw-name" name="name" autocomplete="name" placeholder="Your name" required></div>'
      + '        <div class="iqw-field"><label class="iqw-label" for="iqw-phone">Phone</label><input class="iqw-input" id="iqw-phone" name="phone" autocomplete="tel" inputmode="tel" placeholder="' + PHONE_DISPLAY + '" required></div>'
      + '        <div class="iqw-field"><label class="iqw-label" for="iqw-email">Email optional</label><input class="iqw-input" id="iqw-email" name="email" autocomplete="email" inputmode="email" placeholder="you@example.com"></div>'
      + '        <label class="iqw-consent"><input type="checkbox" id="iqw-sms-consent"><span>Text me about this inspection request. Message frequency varies. Message and data rates may apply. Reply STOP to opt out. Consent is not a condition of purchase. <a href="/privacy-policy/" target="_blank" rel="noopener">Privacy Policy</a> and <a href="/sms-terms/" target="_blank" rel="noopener">SMS Terms</a>.</span></label>'
      + '        <p class="iqw-error" data-error="3">Enter your name and phone number so SMI can follow up.</p>'
      + '      </section>'
      + '      <div class="iqw-actions"><button class="iqw-back" type="button">Back</button><button class="iqw-next" type="button">Next</button></div>'
      + '      <p class="iqw-note">No pressure. SMI reviews the request and follows up with the right next step.</p>'
      + '    </form>'
      + '    <div class="iqw-success"><b>Request sent.</b><p>SMI will review the roof details and follow up. If this is urgent, call now.</p><a class="iqw-call" href="' + PHONE_TEL + '">Call ' + PHONE_DISPLAY + '</a></div>'
      + '  </div>'
      + '  <button class="iqw-launcher" type="button" aria-expanded="false">'
      + '    <span class="iqw-mark">3</span><span class="iqw-launcher-copy"><span>Instant inspection</span><strong>Address, roof issue, contact</strong></span>'
      + '  </button>'
      + '</div>';

    var wrap = root.querySelector('.iqw-wrap');
    var launcher = root.querySelector('.iqw-launcher');
    var close = root.querySelector('.iqw-close');
    var form = root.querySelector('.iqw-form');
    var next = root.querySelector('.iqw-next');
    var back = root.querySelector('.iqw-back');
    var steps = Array.prototype.slice.call(root.querySelectorAll('.iqw-step'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.iqw-dot'));
    var choices = Array.prototype.slice.call(root.querySelectorAll('.iqw-choice'));
    var success = root.querySelector('.iqw-success');
    var selectedService = '';
    var currentStep = 1;

    function setOpen(open) {
      wrap.classList.toggle('iqw-open', open);
      launcher.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        setTimeout(function () {
          var first = root.querySelector('#iqw-address');
          if (first && currentStep === 1) first.focus();
        }, 40);
      }
    }

    function setStep(step) {
      currentStep = Math.max(1, Math.min(3, step));
      steps.forEach(function (node) {
        node.classList.toggle('active', Number(node.getAttribute('data-step')) === currentStep);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index < currentStep);
      });
      back.style.display = currentStep === 1 ? 'none' : 'inline-flex';
      next.textContent = currentStep === 3 ? 'Send Request' : 'Next';
    }

    function showError(step, show) {
      var error = root.querySelector('[data-error="' + step + '"]');
      if (error) error.classList.toggle('show', !!show);
    }

    function validStep(step) {
      if (step === 1) {
        var address = root.querySelector('#iqw-address').value.trim();
        var okAddress = address.length >= 5;
        showError(1, !okAddress);
        return okAddress;
      }
      if (step === 2) {
        var okService = !!selectedService;
        showError(2, !okService);
        return okService;
      }
      if (step === 3) {
        var name = root.querySelector('#iqw-name').value.trim();
        var phone = root.querySelector('#iqw-phone').value.replace(/\D/g, '');
        var okContact = name.length >= 2 && phone.length >= 10;
        showError(3, !okContact);
        return okContact;
      }
      return true;
    }

    function submitRequest() {
      if (!validStep(3)) return;
      var address = root.querySelector('#iqw-address').value.trim();
      var timeline = root.querySelector('#iqw-timeline').value;
      var name = root.querySelector('#iqw-name').value.trim();
      var phone = root.querySelector('#iqw-phone').value.trim();
      var email = root.querySelector('#iqw-email').value.trim();
      var smsConsent = root.querySelector('#iqw-sms-consent').checked;
      var message = [
        'Instant inspection widget request',
        'Roof address: ' + address,
        'Need: ' + selectedService,
        'Timeline: ' + timeline,
        'Page title: ' + context.title
      ].join('\\n');

      next.disabled = true;
      next.textContent = 'Sending...';

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          phone: phone,
          email: email,
          service: 'Instant Inspection - ' + selectedService,
          message: message,
          smsConsent: smsConsent,
          page: window.location.pathname
        })
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        if (!data || !data.success) throw new Error('Lead submission failed');
        form.style.display = 'none';
        success.classList.add('show');
        if (window.fbq) window.fbq('trackCustom', 'InstantInspectionRequest');
      }).catch(function () {
        next.disabled = false;
        next.textContent = 'Send Request';
        alert('Something went wrong. Please call SMI directly at ' + PHONE_DISPLAY + '.');
      });
    }

    launcher.addEventListener('click', function () { setOpen(true); });
    close.addEventListener('click', function () { setOpen(false); });
    back.addEventListener('click', function () { setStep(currentStep - 1); });
    next.addEventListener('click', function () {
      if (currentStep < 3) {
        if (validStep(currentStep)) setStep(currentStep + 1);
      } else {
        submitRequest();
      }
    });
    choices.forEach(function (button) {
      button.addEventListener('click', function () {
        choices.forEach(function (other) { other.classList.remove('active'); });
        button.classList.add('active');
        selectedService = button.getAttribute('data-service');
        showError(2, false);
      });
    });
    root.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setOpen(false);
    });

    setStep(1);
    if (window.location.hash === '#instant-roof-check') setOpen(true);
  });
})();
