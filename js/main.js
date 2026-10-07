/**
 * Twinkle Car Detailing Services - Interactive Architecture & Logic
 * Inspired by detailing.nl UI/UX standards
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initBeforeAfterSlider();
  initCostConfigurator();
  initReviewsFilter();
  initFaqAccordion();
  initBookingForm();
});

/* ==========================================================================
   1. NAVBAR & SCROLL SPY
   ========================================================================== */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky header scroll listener
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // Active section spy
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { passive: true });
}

/* ==========================================================================
   2. INTERACTIVE BEFORE & AFTER SLIDER (TwentyTwenty style)
   ========================================================================== */
function initBeforeAfterSlider() {
  const slider = document.getElementById('beforeAfterSlider');
  const afterContainer = document.getElementById('baAfterContainer');
  const handle = document.getElementById('baHandle');
  const presetBtns = document.querySelectorAll('.ba-preset-btn');

  if (!slider || !afterContainer || !handle) return;

  let isDragging = false;

  function updateSliderPosition(xPercent) {
    // Clamp between 5% and 95%
    const clamped = Math.max(5, Math.min(95, xPercent));
    afterContainer.style.width = `${clamped}%`;
    handle.style.left = `${clamped}%`;

    // Highlight preset button if exact match
    presetBtns.forEach(btn => {
      const val = parseFloat(btn.getAttribute('data-percent'));
      if (Math.abs(val - clamped) < 2) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function handleMove(clientX) {
    const rect = slider.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percent = (offsetX / rect.width) * 100;
    updateSliderPosition(percent);
  }

  // Mouse events
  slider.addEventListener('mousedown', (e) => {
    isDragging = true;
    handleMove(e.clientX);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch events
  slider.addEventListener('touchstart', (e) => {
    isDragging = true;
    if (e.touches[0]) handleMove(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches[0]) return;
    handleMove(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Preset buttons
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const percent = parseFloat(btn.getAttribute('data-percent'));
      updateSliderPosition(percent);
    });
  });

  // Set initial 50%
  updateSliderPosition(50);
}

/* ==========================================================================
   3. INTERACTIVE DETAILING COST ESTIMATOR / CONFIGURATOR
   ========================================================================== */
function initCostConfigurator() {
  const vehicleBtns = document.querySelectorAll('.vehicle-btn');
  const packageCards = document.querySelectorAll('.pkg-radio-card');
  const addonCards = document.querySelectorAll('.addon-card');

  // Summary elements
  const summaryVehicle = document.getElementById('summaryVehicle');
  const summaryPackage = document.getElementById('summaryPackage');
  const summaryTime = document.getElementById('summaryTime');
  const summaryTotal = document.getElementById('summaryTotal');
  const proceedBtn = document.getElementById('configuratorProceedBtn');

  // Pricing Matrix (Base USD / Local currency representation)
  const vehicleMultipliers = {
    sedan: { name: 'Sedan / Coupe', factor: 1.0, timeFactor: 1.0 },
    suv: { name: 'SUV / 4x4 Luxury', factor: 1.25, timeFactor: 1.2 },
    supercar: { name: 'Exotic / Supercar', factor: 1.4, timeFactor: 1.3 },
    motorcycle: { name: 'Motorcycle / Superbike', factor: 0.65, timeFactor: 0.7 }
  };

  const packagePrices = {
    express: { name: 'Gloss Enhancement & Decontamination', base: 120, time: 4 },
    ceramic_pro: { name: 'Ceramic Shield Pro (9H Silica 3-Yr)', base: 350, time: 14 },
    ppf_armor: { name: 'Self-Healing PPF Front End + Ceramic', base: 680, time: 24 },
    interior_master: { name: 'Interior Connoisseur Leather Rejuvenation', base: 180, time: 6 },
    bespoke_ultimate: { name: 'The Ultimate Concierge Restoration', base: 980, time: 36 }
  };

  const addonPrices = {
    engine_bay: { name: 'Steam Cleaned Engine Bay', price: 45 },
    hydro_glass: { name: 'Hydrophobic Glass Rain Shield', price: 60 },
    wheel_ceramic: { name: 'Wheels-Off Ceramic Brake Dust Guard', price: 90 },
    headlight_restoration: { name: 'Headlight Lens Clarity Restoration', price: 50 }
  };

  let currentVehicle = 'sedan';
  let currentPackage = 'ceramic_pro';
  let currentAddons = new Set();

  function calculateAndRender() {
    const vData = vehicleMultipliers[currentVehicle] || vehicleMultipliers.sedan;
    const pData = packagePrices[currentPackage] || packagePrices.ceramic_pro;

    let baseCost = pData.base * vData.factor;
    let totalTime = Math.round(pData.time * vData.timeFactor);

    // Sum addons
    let addonsTotal = 0;
    currentAddons.forEach(addonKey => {
      if (addonPrices[addonKey]) {
        addonsTotal += addonPrices[addonKey].price;
        totalTime += 1;
      }
    });

    const totalEstimate = Math.round(baseCost + addonsTotal);

    if (summaryVehicle) summaryVehicle.textContent = vData.name;
    if (summaryPackage) summaryPackage.textContent = pData.name;
    if (summaryTime) summaryTime.textContent = `${totalTime} - ${totalTime + 4} Hours`;
    if (summaryTotal) summaryTotal.textContent = `$${totalEstimate}`;

    // Pass data into proceed button
    if (proceedBtn) {
      proceedBtn.setAttribute('data-vehicle', vData.name);
      proceedBtn.setAttribute('data-package', pData.name);
      proceedBtn.setAttribute('data-price', `$${totalEstimate}`);
    }
  }

  // Vehicle select
  vehicleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      vehicleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentVehicle = btn.getAttribute('data-vehicle');
      calculateAndRender();
    });
  });

  // Package select
  packageCards.forEach(card => {
    card.addEventListener('click', () => {
      packageCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentPackage = card.getAttribute('data-pkg');
      calculateAndRender();
    });
  });

  // Add-ons select
  addonCards.forEach(card => {
    card.addEventListener('click', () => {
      const addonKey = card.getAttribute('data-addon');
      if (currentAddons.has(addonKey)) {
        currentAddons.delete(addonKey);
        card.classList.remove('active');
      } else {
        currentAddons.add(addonKey);
        card.classList.add('active');
      }
      calculateAndRender();
    });
  });

  // Proceed to booking pre-fill
  if (proceedBtn) {
    proceedBtn.addEventListener('click', () => {
      const serviceSelect = document.getElementById('bookingService');
      const vehicleInput = document.getElementById('bookingVehicle');
      const notesInput = document.getElementById('bookingNotes');

      const vName = proceedBtn.getAttribute('data-vehicle') || 'Sedan';
      const pName = proceedBtn.getAttribute('data-package') || 'Ceramic Shield Pro';
      const pPrice = proceedBtn.getAttribute('data-price') || '$350';

      if (vehicleInput && !vehicleInput.value) {
        vehicleInput.value = vName;
      }

      if (serviceSelect) {
        // match closest option
        for (let i = 0; i < serviceSelect.options.length; i++) {
          if (serviceSelect.options[i].text.includes(pName.substring(0, 10))) {
            serviceSelect.selectedIndex = i;
            break;
          }
        }
      }

      if (notesInput) {
        const addonsList = Array.from(currentAddons).map(k => addonPrices[k]?.name).filter(Boolean).join(', ');
        notesInput.value = `Selected via configurator: ${pName} (${pPrice}). ${addonsList ? 'Addons: ' + addonsList : ''}`;
      }

      // Scroll smoothly to booking
      const bookingSec = document.getElementById('booking');
      if (bookingSec) {
        bookingSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Initial calculation
  calculateAndRender();
}

/* ==========================================================================
   4. REVIEWS FILTER TABS
   ========================================================================== */
function initReviewsFilter() {
  const filterBtns = document.querySelectorAll('.review-filter-btn');
  const reviewCards = document.querySelectorAll('.review-card');

  if (!filterBtns.length || !reviewCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterCategory = btn.getAttribute('data-filter');

      reviewCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterCategory === 'all' || cardCategory === filterCategory || cardCategory.includes(filterCategory)) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   5. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!questionBtn || !answer) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherAns = otherItem.querySelector('.faq-answer');
          if (otherAns) otherAns.style.maxHeight = null;
        }
      });

      // Toggle current
      if (isActive) {
        item.classList.remove('active');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ==========================================================================
   6. BOOKING FORM WITH SECURITY, SANITIZATION & WHATSAPP
   ========================================================================== */
function initBookingForm() {
  const form = document.getElementById('consultationForm');
  const whatsappDirectBtn = document.getElementById('whatsappDirectBtn');
  const successModal = document.getElementById('bookingSuccessModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalDismissBtn = document.getElementById('modalDismissBtn');

  // Input Sanitizer to guard against injection
  function sanitizeInput(str) {
    if (!str) return '';
    return str.replace(/[&<>"'/]/g, function (match) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
      }[match];
    }).trim();
  }

  function validateField(input) {
    const errorMsg = input.parentElement.querySelector('.form-error-msg');
    let isValid = true;

    if (input.hasAttribute('required') && !input.value.trim()) {
      isValid = false;
    } else if (input.type === 'email' && input.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      isValid = emailRegex.test(input.value.trim());
    } else if (input.type === 'tel' && input.value.trim()) {
      const phoneRegex = /^[\d\s+\-()]{7,20}$/;
      isValid = phoneRegex.test(input.value.trim());
    }

    if (!isValid) {
      input.classList.add('error');
      if (errorMsg) errorMsg.style.display = 'block';
    } else {
      input.classList.remove('error');
      if (errorMsg) errorMsg.style.display = 'none';
    }

    return isValid;
  }

  if (form) {
    // Live validation on blur
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) validateField(input);
      });
    });

    // Form submit handler
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Anti-Spam Honeypot verification
      const honeypot = document.getElementById('website_hp');
      if (honeypot && honeypot.value.trim() !== '') {
        console.warn('Spam detected via honeypot.');
        return; // Silent discard
      }

      let formIsValid = true;
      inputs.forEach(input => {
        if (!validateField(input)) {
          formIsValid = false;
        }
      });

      if (!formIsValid) {
        showToast('Please fix highlighted form errors.', 'warning');
        return;
      }

      // Collect & sanitize clean data
      const bookingData = {
        name: sanitizeInput(document.getElementById('bookingName')?.value),
        phone: sanitizeInput(document.getElementById('bookingPhone')?.value),
        email: sanitizeInput(document.getElementById('bookingEmail')?.value),
        vehicle: sanitizeInput(document.getElementById('bookingVehicle')?.value),
        service: sanitizeInput(document.getElementById('bookingService')?.value),
        date: sanitizeInput(document.getElementById('bookingDate')?.value),
        notes: sanitizeInput(document.getElementById('bookingNotes')?.value),
        ref: 'TWK-' + Math.floor(100000 + Math.random() * 900000)
      };

      // Populate confirmation modal
      const modalRefNumber = document.getElementById('modalRefNumber');
      const modalClientName = document.getElementById('modalClientName');
      if (modalRefNumber) modalRefNumber.textContent = bookingData.ref;
      if (modalClientName) modalClientName.textContent = bookingData.name;

      if (successModal) {
        successModal.classList.add('active');
      }

      form.reset();
    });
  }

  // Direct WhatsApp Concierge format generator
  if (whatsappDirectBtn) {
    whatsappDirectBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const name = sanitizeInput(document.getElementById('bookingName')?.value) || 'Valued Client';
      const vehicle = sanitizeInput(document.getElementById('bookingVehicle')?.value) || 'Vehicle';
      const service = sanitizeInput(document.getElementById('bookingService')?.value) || 'Detailing Consultation';
      const date = sanitizeInput(document.getElementById('bookingDate')?.value) || 'Earliest Availability';
      const notes = sanitizeInput(document.getElementById('bookingNotes')?.value);

      const message = `Hello Twinkle Car Detailing Services,\n\nI would like to inquire about a detailing appointment:\n• Name: ${name}\n• Vehicle: ${vehicle}\n• Requested Treatment: ${service}\n• Desired Date: ${date}${notes ? '\n• Specific notes: ' + notes : ''}\n\nCould you please provide availability and schedule my inspection? Thank you!`;

      // Official WhatsApp deep link (business number placeholder or concierge link)
      const encodedMsg = encodeURIComponent(message);
      const waUrl = `https://wa.me/31885874444?text=${encodedMsg}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // Modal dismiss buttons
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      if (successModal) successModal.classList.remove('active');
    });
  }
  if (modalDismissBtn) {
    modalDismissBtn.addEventListener('click', () => {
      if (successModal) successModal.classList.remove('active');
    });
  }
  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        successModal.classList.remove('active');
      }
    });
  }
}

/* ==========================================================================
   TOAST HELPER
   ========================================================================== */
function showToast(message, type = 'info') {
  let toast = document.querySelector('.toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}
