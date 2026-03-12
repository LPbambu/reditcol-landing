/**
 * CREDITCOL — main.js
 * Sistema: Antigravity | v2.1
 * Handles: Meta Pixel, Supabase lead capture, form validation,
 *          UTM tracking, scroll animations, counter animation
 */

document.addEventListener('DOMContentLoaded', () => {

  /* =============================================
     1. META PIXEL — init dinámico desde CONFIG
     ============================================= */
  function initMetaPixel(pixelId) {
    if (!pixelId || pixelId === '${META_PIXEL_ID}') return;
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
      s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
    }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', pixelId);
    fbq('track', 'PageView');
  }

  if (typeof CONFIG !== 'undefined') {
    initMetaPixel(CONFIG.META_PIXEL_ID);
  }

  /* =============================================
     2. SUPABASE — cliente
     ============================================= */
  let supabase = null;

  function initSupabase() {
    if (typeof window.supabase === 'undefined') return null;
    const url = CONFIG?.SUPABASE_URL;
    const key = CONFIG?.SUPABASE_ANON_KEY;
    if (!url || url.includes('${') || !key || key.includes('${')) {
      console.warn('[CreditCol] Supabase no configurado. Revisá el archivo .env');
      return null;
    }
    return window.supabase.createClient(url, key);
  }

  if (typeof CONFIG !== 'undefined') {
    supabase = initSupabase();
  }

  /* =============================================
     3. WHATSAPP — número dinámico
     ============================================= */
  function getWhatsappUrl(message) {
    const number = (typeof CONFIG !== 'undefined' && !CONFIG.WHATSAPP_NUMBER.includes('${'))
      ? CONFIG.WHATSAPP_NUMBER
      : '573001234567'; // fallback local
    const encoded = encodeURIComponent(message || 'Hola, me interesa solicitar un crédito en Creditcol.');
    return `https://wa.me/${number}?text=${encoded}`;
  }

  // Inyectar URLs de WhatsApp en todos los btn-whatsapp
  document.querySelectorAll('[data-whatsapp]').forEach(el => {
    const msg = el.getAttribute('data-whatsapp-msg') || 'Hola, me interesa solicitar un crédito en Creditcol.';
    el.href = getWhatsappUrl(msg);
  });

  /* =============================================
     4. UTM SOURCE — captura automática
     ============================================= */
  function getUTMSource() {
    const params = new URLSearchParams(window.location.search);
    return params.get('utm_source') || params.get('utm_medium') || params.get('fbclid')
      ? `utm_source=${params.get('utm_source') || 'facebook'}`
      : document.referrer || 'directo';
  }

  /* =============================================
     5. HEADER — scroll effect
     ============================================= */
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  /* =============================================
     6. SCROLL ANIMATIONS — fade-up
     ============================================= */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  /* =============================================
     7. COUNTER ANIMATION
     ============================================= */
  function animateCounter(el, final, duration = 2000) {
    const isPlus = el.dataset.suffix === '+';
    const start = 0;
    const startTime = performance.now();
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOut cubic
      const current = Math.round(start + (final - start) * eased);
      el.textContent = current.toLocaleString('es-CO') + (isPlus ? '+' : el.dataset.unit || '');
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const final = parseInt(el.dataset.target, 10);
        animateCounter(el, final);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));

  /* =============================================
     8. SEGMENTACIÓN — click → scroll a form + pre-select
     ============================================= */
  document.querySelectorAll('[data-segment]').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const segment = card.getAttribute('data-segment');
      const tipoSelect = document.getElementById('tipo_cliente');
      if (tipoSelect) tipoSelect.value = segment;
      const formSection = document.getElementById('formulario');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Focus nombre after animation
        setTimeout(() => {
          document.getElementById('nombre')?.focus();
        }, 800);
      }
    });
  });

  /* =============================================
     9. FORMULARIO — validación + envío a Supabase
     ============================================= */
  const form = document.getElementById('leadForm');
  if (form) {
    const btnSubmit   = form.querySelector('#btnSubmit');
    const btnText     = form.querySelector('.btn-text');
    const spinner     = form.querySelector('.spinner');
    const formAlert   = document.getElementById('formAlert');

    // Validación individual de campo
    function validateField(field) {
      const group = field.closest('.form-group');
      const errorEl = group?.querySelector('.form-error');
      let valid = true;
      let msg = '';

      if (field.required && !field.value.trim()) {
        valid = false; msg = 'Este campo es obligatorio.';
      } else if (field.id === 'telefono') {
        const digits = field.value.replace(/\D/g, '');
        if (digits.length < 10 || digits.length > 12) {
          valid = false; msg = 'Ingresa un número válido (10 dígitos).';
        }
      } else if (field.id === 'nombre') {
        if (field.value.trim().length < 3) {
          valid = false; msg = 'El nombre debe tener al menos 3 caracteres.';
        }
      }

      field.classList.toggle('error', !valid);
      if (errorEl) {
        errorEl.textContent = msg;
        errorEl.classList.toggle('show', !valid);
      }
      return valid;
    }

    // Live validation on blur
    form.querySelectorAll('input, select').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) validateField(field);
      });
    });

    // Validar radio groups (reportado)
    function getRadioValue(name) {
      return form.querySelector(`input[name="${name}"]:checked`)?.value ?? null;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validar campos
      const fields = form.querySelectorAll('input:not([type="radio"]), select');
      let allValid = true;
      fields.forEach(f => { if (!validateField(f)) allValid = false; });

      const reportado = getRadioValue('reportado_datacredito');
      const radioError = document.getElementById('radioError');
      if (reportado === null) {
        if (radioError) { radioError.textContent = 'Selecciona una opción.'; radioError.classList.add('show'); }
        allValid = false;
      } else {
        if (radioError) radioError.classList.remove('show');
      }

      if (!allValid) return;

      // Loading state
      btnSubmit.disabled = true;
      btnSubmit.classList.add('loading');
      if (formAlert) { formAlert.className = 'form-alert'; formAlert.textContent = ''; }

      const leadData = {
        nombre: document.getElementById('nombre').value.trim(),
        telefono: document.getElementById('telefono').value.replace(/\D/g, ''),
        tipo_cliente: document.getElementById('tipo_cliente').value,
        ingreso_aproximado: null,
        reportado_datacredito: reportado === 'si',
        fuente: getUTMSource(),
        estado: 'nuevo',
        observaciones: null
      };

      try {
        let success = false;

        if (supabase) {
          const { error } = await supabase.from('leads').insert([leadData]);
          if (error) throw error;
          success = true;
        } else {
          // Modo demo sin Supabase configurado
          console.warn('[CreditCol] Demo mode: Supabase no configurado. Lead no guardado en DB.', leadData);
          await new Promise(r => setTimeout(r, 1200)); // simular delay
          success = true;
        }

        if (success) {
          // Meta Pixel — Lead event
          if (typeof fbq === 'function') { fbq('track', 'Lead'); }

          // Guardar nombre en sessionStorage para página de gracias
          sessionStorage.setItem('cc_nombre', leadData.nombre);
          sessionStorage.setItem('cc_telefono', leadData.telefono);

          // Redirigir a página de gracias
          window.location.href = 'gracias.html';
        }

      } catch (err) {
        console.error('[CreditCol] Error al guardar lead:', err);
        if (formAlert) {
          formAlert.textContent = 'Ocurrió un error. Por favor inténtalo nuevamente.';
          formAlert.className = 'form-alert error-alert';
        }
        btnSubmit.disabled = false;
        btnSubmit.classList.remove('loading');
      }
    });
  }

  /* =============================================
     10. PHONE INPUT — auto-format
     ============================================= */
  const phoneInput = document.getElementById('telefono');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 12) value = value.slice(0, 12);
      e.target.value = value;
    });
  }

});
