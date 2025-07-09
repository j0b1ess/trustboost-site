// TrustBoost AI Frontend App Logic
// Author: Copilot
// Version: 2.0.0 - Fixed All Issues

// === Polyfills for cross-browser support ===
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}
if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    let el = this;
    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

// === Utility functions ===
function throttle(func, limit) {
  let inThrottle;
  return function() {
    if (!inThrottle) {
      func.apply(this, arguments);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

function smoothScrollTo(node) {
  node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (node.tabIndex === -1) node.focus();
}

function setAriaLive(msg) {
  let live = document.getElementById('aria-live');
  if (!live) {
    live = document.createElement('div');
    live.id = 'aria-live';
    live.setAttribute('aria-live', 'polite');
    live.className = 'visually-hidden';
    document.body.appendChild(live);
  }
  live.textContent = msg;
}

// === Lottie Animations ===
const lottieFiles = {
  "lottie-hero": "public/ai-response.json",
  "lottie-review": "public/review.json",
  "lottie-response": "public/ai-response.json",
  "lottie-seo": "public/seo.json",
  "lottie-analytics": "public/analytics.json"
};

function initLottieAnimations() {
  if (typeof lottie === 'undefined') {
    console.warn('Lottie library not loaded');
    return;
  }
  
  Object.entries(lottieFiles).forEach(([id, path]) => {
    const el = document.getElementById(id);
    if (el) {
      try {
        lottie.loadAnimation({
          container: el,
          renderer: "svg",
          loop: true,
          autoplay: true,
          path
        });
      } catch(e) {
        console.warn(`Failed to load animation for ${id}:`, e);
        el.innerHTML = '<div style="font-size:13px;color:#999;">🎬 Animation</div>';
      }
    }
  });
}

// === Animate hero stats ===
function animateStats() {
  document.querySelectorAll(".stat-num[data-animate]").forEach(el => {
    const target = parseInt(el.dataset.animate, 10);
    let cur = 0;
    const inc = Math.max(1, Math.floor(target/70));
    function update() {
      cur += inc;
      if (cur > target) cur = target;
      el.textContent = cur;
      if (cur < target) setTimeout(update, 16);
    }
    update();
  });
}

// === Professional Calendly Integration ===
function initCalendly() {
  const calendlyBtn = document.getElementById('calendly-btn');
  if (!calendlyBtn) return;
  
  calendlyBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple popups
    if (window.calendlyState.popupOpen) {
      console.log('Calendly popup already open');
      return;
    }
    
    console.log('Opening Calendly popup...');
    
    const calendlyUrl = 'https://calendly.com/jyehezkel10/30min';
    
    try {
      // Check if Calendly is loaded and available
      if (window.calendlyState.loaded && window.Calendly && typeof window.Calendly.initPopupWidget === 'function') {
        
        // Set state
        window.calendlyState.popupOpen = true;
        
        // Prevent body scrolling with enhanced positioning
        document.body.classList.add('calendly-overlay-is-open');
        const scrollY = window.scrollY;
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = '0';
        
        // Store scroll position for restoration
        window.calendlyState.scrollY = scrollY;
        
        // Initialize Calendly popup with enhanced configuration
        window.Calendly.initPopupWidget({
          url: calendlyUrl,
          parentElement: document.body,
          prefill: {},
          utm: {},
          // Enhanced options for better loading
          color: '6c47ff',
          text_color: '333333',
          primary_color: '6c47ff'
        });
        
        // Wait for popup to be created, then enhance it
        setTimeout(() => {
          enhanceCalendlyPopup();
          createCalendlyCloseButton();
          setupCalendlyObserver();
        }, 500); // Increased delay to ensure full loading
        
        console.log('Calendly popup opened successfully');
        
      } else {
        // Fallback to new tab
        console.log('Calendly not loaded, opening in new tab');
        openCalendlyInNewTab(calendlyUrl);
      }
      
    } catch (error) {
      console.error('Error opening Calendly:', error);
      // Cleanup and fallback
      window.closeCalendlyPopup();
      openCalendlyInNewTab(calendlyUrl);
    }
  });
}

// Enhance Calendly popup for full content display
function enhanceCalendlyPopup() {
  // Find Calendly popup elements
  const popupSelectors = ['.calendly-overlay', '[data-calendly-popup]', '.calendly-popup'];
  let popupElement = null;
  
  for (const selector of popupSelectors) {
    popupElement = document.querySelector(selector);
    if (popupElement) break;
  }
  
  if (popupElement) {
    // Ensure popup fills the overlay properly
    const overlayStyles = {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: '9999',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)'
    };
    
    Object.assign(popupElement.style, overlayStyles);
    
    // Find the inner popup container
    const innerPopup = popupElement.querySelector('[data-calendly-popup], .calendly-popup, div[style*="width"], div[style*="height"]');
    if (innerPopup) {
      const popupStyles = {
        width: '90%',
        maxWidth: '1000px',
        height: '85%',
        maxHeight: '800px',
        borderRadius: '20px',
        overflow: 'hidden',
        background: '#ffffff',
        boxShadow: '0 32px 64px rgba(0, 0, 0, 0.24), 0 16px 32px rgba(0, 0, 0, 0.16)',
        position: 'relative'
      };
      
      Object.assign(innerPopup.style, popupStyles);
      
      // Find and enhance the iframe
      const iframe = innerPopup.querySelector('iframe');
      if (iframe) {
        const iframeStyles = {
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '20px',
          background: '#ffffff',
          display: 'block'
        };
        
        Object.assign(iframe.style, iframeStyles);
        
        // Wait for iframe to load and add load event
        iframe.addEventListener('load', function() {
          console.log('Calendly iframe loaded successfully');
          
          // Ensure iframe content is visible
          setTimeout(() => {
            if (iframe.contentWindow) {
              try {
                // Try to access iframe content (if same-origin)
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc && iframeDoc.body) {
                  iframeDoc.body.style.overflow = 'auto';
                  iframeDoc.body.style.minHeight = '100%';
                }
              } catch (e) {
                // Cross-origin iframe, can't access content
                console.log('Calendly iframe is cross-origin (expected)');
              }
            }
          }, 100);
        });
        
        // Force iframe refresh if it seems empty
        setTimeout(() => {
          if (iframe.src && !iframe.src.includes('?')) {
            // Add timestamp to force refresh
            const separator = iframe.src.includes('?') ? '&' : '?';
            iframe.src = iframe.src + separator + '_t=' + Date.now();
          }
        }, 1000);
      }
    }
  }
  
  // Add a backup check to ensure content is loaded
  setTimeout(() => {
    const iframe = document.querySelector('.calendly-overlay iframe, [data-calendly-popup] iframe');
    if (iframe && iframe.style.height !== '100%') {
      iframe.style.height = '100%';
      iframe.style.minHeight = '600px';
    }
  }, 2000);
}

// Create professional close button
function createCalendlyCloseButton() {
  // Remove any existing close button
  if (window.calendlyState.closeButton) {
    window.calendlyState.closeButton.remove();
  }
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'calendly-close-btn';
  closeBtn.innerHTML = '×';
  closeBtn.setAttribute('aria-label', 'Close Calendly popup');
  closeBtn.setAttribute('type', 'button');
  
  // Professional inline styling
  closeBtn.style.cssText = `
    position: fixed !important;
    top: 25px !important;
    right: 25px !important;
    width: 48px !important;
    height: 48px !important;
    background: rgba(255, 255, 255, 0.98) !important;
    border: 2px solid rgba(0, 0, 0, 0.1) !important;
    border-radius: 50% !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 28px !important;
    color: #333 !important;
    z-index: 10010 !important;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08) !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    line-height: 1 !important;
    font-weight: 400 !important;
    outline: none !important;
    user-select: none !important;
    -webkit-tap-highlight-color: transparent !important;
  `;
  
  // Event handlers
  closeBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    window.closeCalendlyPopup();
  });
  
  closeBtn.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.05)';
    this.style.background = 'rgba(255, 255, 255, 1)';
    this.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.16), 0 6px 12px rgba(0, 0, 0, 0.12)';
  });
  
  closeBtn.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
    this.style.background = 'rgba(255, 255, 255, 0.98)';
    this.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)';
  });
  
  closeBtn.addEventListener('focus', function() {
    this.style.outline = '2px solid #6c47ff';
    this.style.outlineOffset = '2px';
  });
  
  closeBtn.addEventListener('blur', function() {
    this.style.outline = 'none';
  });
  
  // Add to DOM and store reference
  document.body.appendChild(closeBtn);
  window.calendlyState.closeButton = closeBtn;
}

// Setup observer to detect when popup closes naturally
function setupCalendlyObserver() {
  if (window.calendlyState.observer) {
    window.calendlyState.observer.disconnect();
  }
  
  window.calendlyState.observer = new MutationObserver(function(mutations) {
    // Check if popup still exists
    const popupExists = document.querySelector('.calendly-overlay, [data-calendly-popup]');
    
    if (!popupExists && window.calendlyState.popupOpen) {
      console.log('Calendly popup closed naturally');
      window.closeCalendlyPopup();
    }
  });
  
  // Observe changes to body
  window.calendlyState.observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Safety timeout
  setTimeout(() => {
    if (window.calendlyState.popupOpen && !document.querySelector('.calendly-overlay, [data-calendly-popup]')) {
      window.closeCalendlyPopup();
    }
  }, 10000); // 10 second safety check
}

// Fallback function
function openCalendlyInNewTab(url) {
  const newTab = window.open(url, '_blank', 'noopener,noreferrer');
  if (!newTab) {
    // Show user-friendly message
    const message = 'Please allow popups for this site to schedule a call, or visit:\n' + url;
    alert(message);
  }
}

// === Theme Toggle ===
function initThemeToggle() {
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", ()=> {
      document.body.classList.toggle("dark");
      themeBtn.innerHTML = document.body.classList.contains("dark")
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
    });
  }
}

// === Mobile Nav Toggle ===
function initMobileNav() {
  const navLinks = document.getElementById("nav-links");
  const mobileNavToggle = document.getElementById("mobile-nav-toggle");
  if (mobileNavToggle && navLinks) {
    mobileNavToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      mobileNavToggle.classList.toggle("open");
    });
    // Close nav if link clicked
    document.querySelectorAll('#nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileNavToggle.classList.remove('open');
      });
    });
  }
}

// === Smooth scroll and focus for anchor links + skip ===
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          smoothScrollTo(target);
        }
      }
    });
  });
}

// === Pricing Toggle ===
function initPricingToggle() {
  const billingToggle = document.getElementById("billing-toggle");
  if (billingToggle) {
    function updatePrices() {
      const yearly = billingToggle.checked;
      document.querySelectorAll(".price .monthly").forEach(e => e.style.display = yearly ? "none" : "inline");
      document.querySelectorAll(".price .yearly").forEach(e => e.style.display = yearly ? "inline" : "none");
      document.querySelectorAll(".price .interval").forEach(e => e.textContent = yearly ? "/yr" : "/mo");
    }
    billingToggle.addEventListener("change", updatePrices);
    updatePrices();
  }
}

// === Testimonials Carousel ===
function initTestimonialsCarousel() {
  const testimonialsEls = Array.from(document.querySelectorAll('.testimonial'));
  const carousel = document.getElementById('testimonials-carousel');
  
  if (!testimonialsEls.length || !carousel) {
    console.warn('Testimonials carousel elements not found');
    return;
  }

  let tIndex = 0;
  let autoAdvanceTimer = null;
  let isPaused = false;

  function updateTestimonial(idx, announce = true) {
    testimonialsEls.forEach((el, i) => {
      el.classList.toggle('active', i === idx);
      el.setAttribute('aria-hidden', i !== idx);
      if (i === idx) el.setAttribute('tabindex', '0');
      else el.setAttribute('tabindex', '-1');
    });
    if (announce && testimonialsEls[idx]) {
      const text = testimonialsEls[idx].querySelector('p');
      if (text) setAriaLive(text.innerText);
    }
  }

  function nextTestimonial() {
    tIndex = (tIndex + 1) % testimonialsEls.length;
    updateTestimonial(tIndex);
  }
  
  function prevTestimonial() {
    tIndex = (tIndex - 1 + testimonialsEls.length) % testimonialsEls.length;
    updateTestimonial(tIndex);
  }
  
  function goToTestimonial(idx) {
    tIndex = idx;
    updateTestimonial(tIndex);
  }

  // Button controls
  const nextBtn = document.getElementById('testimonial-next');
  const prevBtn = document.getElementById('testimonial-prev');
  if (nextBtn) nextBtn.onclick = nextTestimonial;
  if (prevBtn) prevBtn.onclick = prevTestimonial;

  // Keyboard controls
  carousel.addEventListener('keydown', function(e) {
    if (e.key === "ArrowRight") { nextTestimonial(); e.preventDefault(); }
    if (e.key === "ArrowLeft") { prevTestimonial(); e.preventDefault(); }
    if (e.key === "Home") { goToTestimonial(0); e.preventDefault(); }
    if (e.key === "End") { goToTestimonial(testimonialsEls.length-1); e.preventDefault(); }
  });

  // Touch controls
  let startX = null;
  carousel.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) startX = e.touches[0].clientX;
  });
  carousel.addEventListener('touchend', function(e) {
    if (!startX) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (dx > 50) prevTestimonial();
    else if (dx < -50) nextTestimonial();
    startX = null;
  });

  // Auto advance
  function startAutoAdvance() {
    if (autoAdvanceTimer) clearInterval(autoAdvanceTimer);
    autoAdvanceTimer = setInterval(() => {
      if (!isPaused && window.innerWidth > 700) nextTestimonial();
    }, 6000);
  }

  // Pause on hover/focus
  carousel.addEventListener('mouseenter', () => isPaused = true);
  carousel.addEventListener('mouseleave', () => isPaused = false);
  carousel.addEventListener('focusin', () => isPaused = true);
  carousel.addEventListener('focusout', () => isPaused = false);

  // Click handlers
  testimonialsEls.forEach((el, idx) => {
    el.addEventListener('click', () => { goToTestimonial(idx); });
    el.addEventListener('focus', () => { goToTestimonial(idx); });
  });

  // Initialize
  updateTestimonial(0, false);
  startAutoAdvance();
}

// === Newsletter, Contact Form handlers ===
function initFormHandlers() {
  // Enhanced Contact form handler
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const nameInput = contactForm.querySelector('input[name="name"]');
      const emailInput = contactForm.querySelector('input[name="email"]');
      const phoneInput = contactForm.querySelector('input[name="phone"]');
      const messageInput = contactForm.querySelector('textarea[name="message"]');
      const submitBtn = document.querySelector('.contact-submit-btn');
      
      // Validate required fields
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const message = messageInput.value.trim();
      const phone = phoneInput.value.trim();
      
      if (!name) {
        showContactMessage('Please enter your name.', 'error');
        nameInput.focus();
        return;
      }
      
      if (!email) {
        showContactMessage('Please enter your email address.', 'error');
        emailInput.focus();
        return;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showContactMessage('Please enter a valid email address.', 'error');
        emailInput.focus();
        return;
      }
      
      if (!message) {
        showContactMessage('Please enter your message.', 'error');
        messageInput.focus();
        return;
      }
      
      // Disable submit button
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      
      // Create mailto link with all form data
      const subject = encodeURIComponent('Contact Form Submission from ' + name);
      const body = encodeURIComponent(
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        (phone ? `Phone: ${phone}\n` : '') +
        `\nMessage:\n${message}`
      );
      
      const mailtoLink = `mailto:trustboostaicontact@gmail.com?subject=${subject}&body=${body}`;
      
      // Open mailto link
      window.location.href = mailtoLink;
      
      // Show success message and reset form
      setTimeout(() => {
        showContactMessage('Thank you for your message! Your email client should have opened. We will get back to you soon.', 'success');
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
        setAriaLive('Contact form submitted successfully!');
      }, 1000);
    });
  }
  
  // Enhanced Newsletter form handler with Mailchimp integration
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const emailInput = document.getElementById('newsletter-email');
      const submitBtn = document.querySelector('.newsletter-submit-btn');
      
      // Validate email
      const email = emailInput.value.trim();
      if (!email) {
        showNewsletterMessage('Please enter your email address.', 'error');
        emailInput.focus();
        return;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNewsletterMessage('Please enter a valid email address.', 'error');
        emailInput.focus();
        return;
      }
      
      // Disable submit button and show loading
      submitBtn.disabled = true;
      submitBtn.textContent = 'Subscribing...';
      
      // Create the JSONP URL for Mailchimp
      const baseUrl = 'https://trustboostai.us18.list-manage.com/subscribe/post-json';
      const params = new URLSearchParams({
        u: '6ffecacb71a9b264660bf0919',
        id: 'f01f0b9606',
        EMAIL: email,
        c: 'mailchimpCallback'
      });
      
      // Create JSONP callback
      window.mailchimpCallback = function(data) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Subscribe';
        
        if (data.result === 'success') {
          showNewsletterMessage('Thank you for subscribing! Please check your email to confirm.', 'success');
          emailInput.value = '';
          setAriaLive('Successfully subscribed to newsletter!');
        } else {
          let errorMessage = 'Subscription failed. Please try again.';
          if (data.msg) {
            // Clean up Mailchimp error messages
            errorMessage = data.msg
              .replace(/0 - /, '')
              .replace(/1 - /, '')
              .replace(/<[^>]*>/g, '')
              .replace('Please enter a value', 'Please try again or contact support if the issue persists');
          }
          showNewsletterMessage(errorMessage, 'error');
          setAriaLive('Newsletter subscription failed.');
        }
        
        // Clean up
        delete window.mailchimpCallback;
        const script = document.querySelector('script[src*="list-manage.com"]');
        if (script) script.remove();
      };
      
      // Create script tag for JSONP request
      const script = document.createElement('script');
      script.src = `${baseUrl}?${params.toString()}`;
      script.onerror = function() {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Subscribe';
        showNewsletterMessage('Network error. Please check your connection and try again.', 'error');
        delete window.mailchimpCallback;
        if (script.parentNode) script.parentNode.removeChild(script);
      };
      
      document.head.appendChild(script);
    });
  }
}

// Helper function to show contact form messages
function showContactMessage(message, type) {
  const messageDiv = document.getElementById('contact-message');
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = `contact-message ${type}`;
    messageDiv.style.display = 'block';
    
    // Hide message after 8 seconds for contact form (longer since it's more detailed)
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 8000);
  }
}

// Helper function to show newsletter messages
function showNewsletterMessage(message, type) {
  const messageDiv = document.getElementById('newsletter-message');
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = `newsletter-message ${type}`;
    messageDiv.style.display = 'block';
    
    // Hide message after 5 seconds
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }
}

// === Skip Link accessibility ===
function initSkipLink() {
  const skipLink = document.getElementById('skip-link');
  if (skipLink) {
    skipLink.addEventListener('focus', () => skipLink.classList.add('visible'));
    skipLink.addEventListener('blur', () => skipLink.classList.remove('visible'));
  }
}

// === Focus management for section navigation ===
function initFocusManagement() {
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab' && e.target.matches('.carousel-controls button')) {
      const focusables = Array.from(document.querySelectorAll('.carousel-controls button'));
      let idx = focusables.indexOf(document.activeElement);
      if (e.shiftKey && idx === 0) {
        focusables[focusables.length - 1].focus();
        e.preventDefault();
      } else if (!e.shiftKey && idx === focusables.length - 1) {
        focusables[0].focus();
        e.preventDefault();
      }
    }
  });
}

// === Utility: visually-hidden class for ARIA live ===
function addAriaLiveStyles() {
  const style = document.createElement('style');
  style.textContent = `.visually-hidden{position:absolute!important;height:1px;width:1px;overflow:hidden;clip:rect(1px,1px,1px,1px);white-space:nowrap}`;
  document.head.appendChild(style);
}

// === Stripe Checkout URL Map & Direct Redirect Logic ===
const stripeCheckoutUrls = {
  starter: {
    monthly: 'https://buy.stripe.com/28EcN6cSPcJUfQCbwH00000',
    yearly: 'https://buy.stripe.com/14A28s7yv7pA7k6asD00003'
  },
  pro: {
    monthly: 'https://buy.stripe.com/fZu00kcSP11ceMycAL00001',
    yearly: 'https://buy.stripe.com/00w4gA8Cz7pA8oabwH00004'
  },
  enterprise: {
    monthly: 'https://buy.stripe.com/fZu4gAdWT4do33QbwH00002',
    yearly: 'https://buy.stripe.com/9B66oI06339k33Q30b00005'
  }
};

// Stripe Checkout logic - Direct URL redirect
function launchStripeCheckout(plan, period) {
  const checkoutUrl = stripeCheckoutUrls[plan][period];
  if (!checkoutUrl) {
    alert('Invalid plan or billing period selected.');
    return;
  }
  
  // Redirect directly to the Stripe checkout URL
  window.location.href = checkoutUrl;
}

// === Initialize Stripe handlers ===
function initStripeHandlers() {
  document.querySelectorAll('.pricing-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get plan from data attribute
      let plan = btn.getAttribute('data-plan') || 'starter';
      
      // Fallback to detecting from card structure if data attribute is missing
      if (!plan || plan === '') {
        const card = btn.closest('.pricing-card');
        if (card) {
          if (card.classList.contains('popular')) {
            plan = 'pro';
          } else if (card.querySelector('h3') && /enterprise/i.test(card.querySelector('h3').innerText)) {
            plan = 'enterprise';
          } else {
            plan = 'starter';
          }
        }
      }
      
      let period = 'monthly';
      const billingToggle = document.getElementById("billing-toggle");
      if (billingToggle && billingToggle.checked) period = "yearly";
      
      console.log(`Launching Stripe checkout for ${plan} ${period}`);
      launchStripeCheckout(plan, period);
    });
  });
}

// === Main initialization ===
document.addEventListener("DOMContentLoaded", function() {
  console.log('TrustBoost AI: Initializing application...');
  
  // Add styles first
  addAriaLiveStyles();
  
  // Initialize all components
  initCalendly();
  initThemeToggle();
  initMobileNav();
  initSmoothScroll();
  initPricingToggle();
  initTestimonialsCarousel();
  initFormHandlers();
  initSkipLink();
  initFocusManagement();
  animateStats();
  
  // Initialize Lottie animations with delay to ensure library is loaded
  setTimeout(initLottieAnimations, 100);
  
  // Initialize Stripe handlers
  initStripeHandlers();
  
  // Clear any existing Stripe checkout content
  const stripeCheckoutSection = document.querySelector('.stripe-checkout');
  if (stripeCheckoutSection) {
    stripeCheckoutSection.innerHTML = '<div style="text-align:center;color:#888;font-size:1.1em;">Select a plan above to proceed to secure checkout.</div>';
  }
  
  console.log('TrustBoost AI: Application initialized successfully!');
});