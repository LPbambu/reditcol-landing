/**
 * CREDITCOL — main.js
 * Sistema: Antigravity | v2.1
 * Handles: Meta Pixel, Supabase lead capture, form validation,
 *          UTM tracking, scroll animations, counter animation
 */

document.addEventListener('DOMContentLoaded', () => {

  /* =============================================
     1. META PIXEL — inicializado globalmente en <head>
     Se ha eliminado la inyección dinámica para no duplicar.
     ============================================= */

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
    const number = '573044387185';
    const encoded = encodeURIComponent(message || 'Hola, me interesa solicitar un crédito en Creditcol.');
    return `https://wa.me/${number}?text=${encoded}`;
  }

  // Inyectar URLs de WhatsApp en todos los btn-whatsapp
  document.querySelectorAll('[data-whatsapp]').forEach(el => {
    const msg = el.getAttribute('data-whatsapp-msg') || 'Hola, me interesa solicitar un crédito en Creditcol.';
    el.href = getWhatsappUrl(msg);
    
    // Evento para Meta Pixel: Contact
    el.addEventListener('click', () => {
      if (typeof fbq === 'function') { 
        fbq('track', 'Contact'); 
      }
    });
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
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    // Both forms use same structure, IDs are unfortunately duplicated in HTML, 
    // so we use querySelector within the form context.
    const btnSubmit   = form.querySelector('button[type="submit"]');
    const formAlert   = form.previousElementSibling; // The div id="formAlert" is visually right before the form

    // Validación individual de campo
    function validateField(field) {
      const group = field.closest('.form-group');
      const errorEl = group?.querySelector('.form-error');
      let valid = true;
      let msg = '';

      if (field.required && !field.value.trim()) {
        valid = false; msg = 'Este campo es obligatorio.';
      } else if (field.name === 'telefono' || field.id === 'telefono') {
        const digits = field.value.replace(/\D/g, '');
        if (digits.length < 10 || digits.length > 12) {
          valid = false; msg = 'Ingresa un número válido (10 dígitos).';
        }
      } else if (field.name === 'nombre' || field.id === 'nombre') {
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
    function getRadioValue() {
      return form.querySelector('input[type="radio"]:checked')?.value ?? null;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validar campos
      const fields = form.querySelectorAll('input:not([type="radio"]), select');
      let allValid = true;
      fields.forEach(f => { if (!validateField(f)) allValid = false; });

      const reportado = getRadioValue();
      const radioGroup = form.querySelector('.radio-group');
      const radioError = radioGroup ? radioGroup.nextElementSibling : null;
      
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
        nombre: form.querySelector('[name="nombre"]').value.trim(),
        telefono: form.querySelector('[name="telefono"]').value.replace(/\D/g, ''),
        tipo_cliente: form.querySelector('[name="tipo_cliente"]').value,
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
          // Guardar nombre en sessionStorage para página de gracias
          sessionStorage.setItem('cc_nombre', leadData.nombre);
          sessionStorage.setItem('cc_telefono', leadData.telefono);

          // Redirigir a página de gracias
          window.location.href = 'gracias.html';
        }

      } catch (err) {
        console.error('[CreditCol] Error al guardar lead:', err);
        if (formAlert) {
          const errMsg = err.message || err.error_description || (typeof err === 'string' ? err : 'Por favor inténtalo nuevamente.');
          formAlert.textContent = 'Ocurrió un error. ' + errMsg;
          formAlert.className = 'form-alert error-alert';
        }
        btnSubmit.disabled = false;
        btnSubmit.classList.remove('loading');
      }
    });
  });

  /* =============================================
     10. PHONE INPUT — auto-format
     ============================================= */
  document.querySelectorAll('input[name="telefono"]').forEach(phoneInput => {
    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 12) value = value.slice(0, 12);
      e.target.value = value;
    });
  });

});
