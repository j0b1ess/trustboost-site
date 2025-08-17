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









// === Theme Toggle ===
function initThemeToggle() {
  const themeBtn = document.getElementById("theme-toggle");
  const themeIcon = themeBtn?.querySelector("i");
  
  if (themeBtn && themeIcon) {
    themeBtn.addEventListener("click", ()=> {
      document.body.classList.toggle("dark");
      const isDark = document.body.classList.contains("dark");
      
      // Update icon - sun for light mode, moon for dark mode
      if (isDark) {
        themeIcon.className = 'fa-solid fa-moon';
        themeBtn.setAttribute('aria-label', 'Switch to Light Mode');
      } else {
        themeIcon.className = 'fa-solid fa-sun';
        themeBtn.setAttribute('aria-label', 'Switch to Dark Mode');
      }
      
      // Debug log
      console.log('Dark mode:', isDark ? 'enabled' : 'disabled');
      
      // Force repaint for testimonials
      const testimonials = document.querySelectorAll('.testimonial');
      testimonials.forEach(testimonial => {
        testimonial.style.display = 'none';
        testimonial.offsetHeight; // Force reflow
        testimonial.style.display = '';
      });
    });
  }
}

// === Mobile Nav Toggle ===
function initMobileNav() {
  const navLinks = document.getElementById("nav-links");
  const mobileNavToggle = document.getElementById("mobile-nav-toggle");
  
  if (mobileNavToggle && navLinks) {
    // Toggle navigation on button click
    mobileNavToggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isActive = navLinks.classList.contains("active");
      
      if (isActive) {
        // Close nav
        navLinks.classList.remove("active");
        mobileNavToggle.classList.remove("open");
        mobileNavToggle.setAttribute("aria-expanded", "false");
      } else {
        // Open nav
        navLinks.classList.add("active");
        mobileNavToggle.classList.add("open");
        mobileNavToggle.setAttribute("aria-expanded", "true");
      }
    });
    
    // Add better touch support for mobile compatibility
    mobileNavToggle.addEventListener("touchstart", (e) => {
      // Don't prevent default to allow normal touch behavior
      // Just add a small visual feedback
      mobileNavToggle.style.transform = 'scale(0.95)';
    }, { passive: true });
    
    mobileNavToggle.addEventListener("touchend", (e) => {
      mobileNavToggle.style.transform = '';
    }, { passive: true });
    
    // Close nav if link clicked
    document.querySelectorAll('#nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileNavToggle.classList.remove('open');
        mobileNavToggle.setAttribute("aria-expanded", "false");
      });
    });
    
    // Close nav when clicking outside
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !mobileNavToggle.contains(e.target)) {
        navLinks.classList.remove('active');
        mobileNavToggle.classList.remove('open');
        mobileNavToggle.setAttribute("aria-expanded", "false");
      }
    });
    
    // Close nav on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        mobileNavToggle.classList.remove('open');
        mobileNavToggle.setAttribute("aria-expanded", "false");
        mobileNavToggle.focus();
      }
    });
    
    // Set initial aria attributes
    mobileNavToggle.setAttribute("aria-expanded", "false");
    mobileNavToggle.setAttribute("aria-controls", "nav-links");
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

// === Mobile-specific optimizations ===
function initMobileOptimizations() {
  // Fix viewport height on mobile browsers (iOS Safari, etc.)
  function setVH() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  
  setVH();
  window.addEventListener('resize', setVH);
  
  // Improve touch performance
  if ('passive' in document.createElement('div')) {
    document.addEventListener('touchstart', () => {}, { passive: true });
    document.addEventListener('touchmove', () => {}, { passive: true });
  }
  
  // Add touch feedback for buttons
  document.querySelectorAll('.btn, button, [role="button"]').forEach(button => {
    button.addEventListener('touchstart', function() {
      this.style.transform = 'scale(0.98)';
    }, { passive: true });
    
    button.addEventListener('touchend', function() {
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    }, { passive: true });
  });
  
  // Improve form input behavior on mobile
  document.querySelectorAll('input, textarea').forEach(input => {
    // Prevent zoom on input focus (iOS)
    input.addEventListener('focus', function() {
      if (window.innerWidth < 768) {
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
      }
    });
    
    input.addEventListener('blur', function() {
      if (window.innerWidth < 768) {
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
        }
      }
    });
  });
  
  // Detect if device supports hover
  const hasHover = window.matchMedia('(hover: hover)').matches;
  if (!hasHover) {
    document.body.classList.add('no-hover');
  }
  
  // Add swipe support for testimonials carousel
  const carousel = document.getElementById('testimonials-carousel');
  if (carousel) {
    let startX = 0;
    let endX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });
    
    carousel.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) { // Minimum swipe distance
        if (diff > 0) {
          // Swipe left - next
          const nextBtn = document.getElementById('testimonial-next');
          if (nextBtn) nextBtn.click();
        } else {
          // Swipe right - previous
          const prevBtn = document.getElementById('testimonial-prev');
          if (prevBtn) prevBtn.click();
        }
      }
    }, { passive: true });
  }
}

// === Enhanced Mobile Navigation ===
function initEnhancedMobileNav() {
  const navLinks = document.getElementById("nav-links");
  const mobileNavToggle = document.getElementById("mobile-nav-toggle");
  const body = document.body;
  
  if (mobileNavToggle && navLinks) {
    // Enhanced mobile menu toggle with better UX
    function toggleMobileMenu(isOpen) {
      if (isOpen) {
        navLinks.classList.add('active', 'open');
        mobileNavToggle.classList.add('open');
        mobileNavToggle.setAttribute('aria-expanded', 'true');
        mobileNavToggle.innerHTML = '<i class="fa-solid fa-times"></i>';
        body.style.overflow = 'hidden'; // Prevent background scrolling
      } else {
        navLinks.classList.remove('active', 'open');
        mobileNavToggle.classList.remove('open');
        mobileNavToggle.setAttribute('aria-expanded', 'false');
        mobileNavToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        body.style.overflow = ''; // Restore scrolling
      }
    }
    
    // Close nav on link click (immediate action)
    document.querySelectorAll('#nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        toggleMobileMenu(false);
      });
    });
    
    // Close nav when clicking outside (immediate action)
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !mobileNavToggle.contains(e.target)) {
        if (navLinks.classList.contains('active')) {
          toggleMobileMenu(false);
        }
      }
    });
    
    // Close nav on escape key (immediate action)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        toggleMobileMenu(false);
        mobileNavToggle.focus();
      }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
        toggleMobileMenu(false);
      }
    });
  }
}

// === Mobile Optimization Functions ===
function initMobileOptimizations() {
  // Improve touch interactions for mobile devices
  if ('ontouchstart' in window) {
    console.log('Mobile Optimizations: Touch device detected, applying optimizations');
    
    // Add touch feedback for interactive elements
    const interactiveElements = document.querySelectorAll(
      '.btn, button, [role="button"], .suggestion-btn, .pricing-btn, .carousel-controls button, #theme-toggle'
    );
    
    interactiveElements.forEach(element => {
      element.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.95)';
        this.style.transition = 'transform 0.1s ease';
      }, { passive: true });
      
      element.addEventListener('touchend', function() {
        setTimeout(() => {
          this.style.transform = '';
        }, 150);
      }, { passive: true });
      
      element.addEventListener('touchcancel', function() {
        this.style.transform = '';
      }, { passive: true });
    });
    
    // Improve scroll behavior for iOS
    document.addEventListener('touchmove', function(e) {
      const navLinks = document.getElementById('nav-links');
      if (navLinks && navLinks.classList.contains('active')) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // Fix iOS viewport issues
    function fixiOSViewport() {
      const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      document.documentElement.style.setProperty('--vh', `${viewportHeight * 0.01}px`);
    }
    
    // Set initial viewport height
    fixiOSViewport();
    
    // Update on viewport changes (keyboard open/close on mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', fixiOSViewport);
    } else {
      window.addEventListener('resize', fixiOSViewport);
    }
    
    // Prevent zoom on double tap for iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }
  
  // Improve form inputs for mobile
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    // Prevent zoom on focus for iOS
    input.addEventListener('focus', function() {
      if (window.innerWidth <= 768) {
        this.style.fontSize = '16px';
      }
    });
    
    // Restore original font size on blur
    input.addEventListener('blur', function() {
      this.style.fontSize = '';
    });
  });
  
  // Improve carousel for mobile
  const carousel = document.getElementById('testimonials-carousel');
  if (carousel) {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    carousel.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });
    
    carousel.addEventListener('touchmove', function(e) {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    }, { passive: true });
    
    carousel.addEventListener('touchend', function() {
      if (!isDragging) return;
      
      const diffX = startX - currentX;
      const threshold = 50;
      
      if (Math.abs(diffX) > threshold) {
        const nextBtn = document.getElementById('testimonial-next');
        const prevBtn = document.getElementById('testimonial-prev');
        
        if (diffX > 0 && nextBtn) {
          nextBtn.click();
        } else if (diffX < 0 && prevBtn) {
          prevBtn.click();
        }
      }
      
      isDragging = false;
    }, { passive: true });
  }
  
  console.log('Mobile Optimizations: Initialized successfully');
}

// === AI Assistant functionality ===
function initAIAssistant() {
  // Get the required HTML elements using the specified IDs
  const form = document.getElementById('ai-assistant-form');
  const userInput = document.getElementById('user-input');
  const askButton = document.getElementById('ask-button');
  const responseBox = document.getElementById('response-box');
  const loadingDiv = document.getElementById('ai-assistant-loading');
  const placeholderResponse = document.getElementById('placeholder-response');
  const typingText = document.getElementById('typing-text');
  
  // Check if all required elements exist in the DOM
  if (!form || !userInput || !askButton || !responseBox) {
    console.warn('AI Assistant: Required elements not found in DOM');
    return;
  }
  
  // Backend API endpoint URL
  const BACKEND_URL = 'https://trustboost-ai-backend-jsyinvest7.replit.app/api/chat';
  
  // Conversation memory - stores last 3 user messages and AI responses
  let conversationHistory = [];
  const MAX_HISTORY_LENGTH = 6; // 3 user messages + 3 AI responses = 6 total
  
  // Starter plan limitations
  const STARTER_MESSAGE_LIMIT = 2; // Free limit for Starter plan users
  
  // Request state management to prevent duplicate submissions
  let isRequestPending = false;

  // === Persistent Usage Limit Banner Logic ===
  const USAGE_ENDPOINT = 'https://trustboost-ai-backend-jsyinvest7.replit.app/api/usage/starter';
  let bannerInjected = false;

  function createUsageLimitBanner() {
    if (document.getElementById('usage-limit-top-banner')) return;
    // Respect session dismissal flag
    try {
      if (sessionStorage.getItem('usageBannerDismissed') === '1') {
        return; // User dismissed for this session
      }
    } catch(_) {}
    const banner = document.createElement('div');
    banner.id = 'usage-limit-top-banner';
    banner.className = 'usage-limit-banner';
    banner.innerHTML = `
      <div class="banner-content">
        <span><strong>Limit Reached:</strong> You've reached your free plan limit for AI messages. Upgrade your plan to continue using TrustBoostAI.</span>
        <button type="button" class="upgrade-btn" id="banner-upgrade-btn">
          <i class="fa-solid fa-arrow-up"></i> Upgrade Now
        </button>
        <button type="button" class="banner-close-btn" id="banner-close-btn" aria-label="Dismiss usage limit banner">&times;</button>
      </div>`;
    // Insert as first element inside body (after possible existing nav offset)
    document.body.prepend(banner);
    requestAnimationFrame(() => banner.classList.add('show'));

    const upgradeBtn = banner.querySelector('#banner-upgrade-btn');
    if (upgradeBtn) {
      upgradeBtn.addEventListener('click', () => {
        // Prefer existing billing toggle + pricing section if present
        const billingToggle = document.getElementById('billing-toggle');
        let period = 'monthly';
        if (billingToggle && billingToggle.checked) period = 'yearly';
        // Direct user toward Pro starter upgrade (Stripe checkout) – adapt as needed
        const stripeUrlMap = {
          monthly: 'https://buy.stripe.com/fZu00kcSP11ceMycAL00001',
          yearly: 'https://buy.stripe.com/00w4gA8Cz7pA8oabwH00004'
        };
        const target = stripeUrlMap[period] || stripeUrlMap.monthly;
        window.location.href = target;
      });
    }
    const closeBtn = banner.querySelector('#banner-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        try { sessionStorage.setItem('usageBannerDismissed','1'); } catch(_) {}
        banner.classList.remove('show');
        banner.classList.add('hide');
        setTimeout(()=> banner.remove(), 300);
      });
    }
  }

  async function checkStarterUsageAndShowBanner(forceRefresh = false) {
    try {
      const tier = getUserSubscriptionTier();
      if (tier !== 'Starter') return; // Only relevant for Starter

      // Avoid duplicate fetches if banner already injected
      if (bannerInjected) return;
      // Caching: attempt to read from sessionStorage
      const CACHE_KEY = 'usageCache';
      const FIFTEEN_MIN_MS = 15 * 60 * 1000;
      let usageData = null;
      if (!forceRefresh) {
        const cachedRaw = sessionStorage.getItem(CACHE_KEY);
        if (cachedRaw) {
          try {
            const parsed = JSON.parse(cachedRaw);
            if (parsed && parsed.timestamp && (Date.now() - parsed.timestamp) < FIFTEEN_MIN_MS) {
              usageData = parsed.data;
              // console.log('Usage Banner: Using cached usage data');
            }
          } catch (_) { /* ignore parse errors */ }
        }
      }

      if (!usageData) {
        const resp = await fetch(USAGE_ENDPOINT, { method: 'GET' });
        if (!resp.ok) {
          console.warn('Usage Banner: Failed to fetch usage endpoint status=', resp.status);
          return;
        }
        usageData = await resp.json().catch(() => ({}));
        // Store in cache
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: usageData }));
        } catch (e) {
          // Ignore quota or storage errors
        }
      }
      // Expecting usageData.messageCount or similar; fallback checks
      const messageCount = usageData.messageCount ?? usageData.count ?? usageData.used ?? 0;
      if (messageCount >= STARTER_MESSAGE_LIMIT) {
        // Only create if not dismissed
        if (!sessionStorage.getItem('usageBannerDismissed')) {
          createUsageLimitBanner();
          bannerInjected = true;
          console.log('Usage Banner: Displayed persistent top banner for Starter plan limit reached');
        }
      }
    } catch (err) {
      console.warn('Usage Banner: Error checking usage', err);
    }
  }

  // Defer banner check slightly to allow other init work
  setTimeout(checkStarterUsageAndShowBanner, 1200);
  
  /**
   * Gets the current session message count for Starter plan users
   * @returns {number} - The number of messages sent in current session
   */
  function getSessionMessageCount() {
    const sessionCount = sessionStorage.getItem('starterMessageCount');
    return sessionCount ? parseInt(sessionCount) : 0;
  }
  
  /**
   * Increments the session message count for Starter plan users
   */
  function incrementSessionMessageCount() {
    const currentCount = getSessionMessageCount();
    sessionStorage.setItem('starterMessageCount', (currentCount + 1).toString());
  }
  
  /**
   * Checks if Starter plan user has reached their message limit
   * @returns {boolean} - True if limit is reached
   */
  function hasReachedStarterLimit() {
    return getSessionMessageCount() >= STARTER_MESSAGE_LIMIT;
  }

  /**
   * Disables the submit button and suggestion buttons to prevent duplicate requests
   */
  function disableSubmissionButtons() {
    isRequestPending = true;
    
    // Disable the main submit button
    if (askButton) {
      askButton.disabled = true;
      askButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
      askButton.style.opacity = '0.6';
      askButton.style.cursor = 'not-allowed';
    }
    
    // Disable all suggestion buttons
    const suggestionButtons = document.querySelectorAll('.suggestion-btn');
    suggestionButtons.forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.6';
      btn.style.cursor = 'not-allowed';
      btn.style.pointerEvents = 'none';
    });
    
    // Disable the textarea
    if (userInput) {
      userInput.disabled = true;
      userInput.style.opacity = '0.7';
    }
    
    console.log('AI Assistant: Submission buttons disabled while request is pending');
  }

  /**
   * Re-enables the submit button and suggestion buttons after request completion
   */
  function enableSubmissionButtons() {
    isRequestPending = false;
    
    // Re-enable the main submit button
    if (askButton) {
      askButton.disabled = false;
      askButton.innerHTML = 'Ask AI';
      askButton.style.opacity = '';
      askButton.style.cursor = '';
    }
    
    // Re-enable all suggestion buttons
    const suggestionButtons = document.querySelectorAll('.suggestion-btn');
    suggestionButtons.forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '';
      btn.style.cursor = '';
      btn.style.pointerEvents = '';
    });
    
    // Re-enable the textarea
    if (userInput) {
      userInput.disabled = false;
      userInput.style.opacity = '';
    }
    
    console.log('AI Assistant: Submission buttons re-enabled after request completion');
  }

  /**
   * Adds a message to the conversation history
   * @param {string} role - 'user' or 'assistant'
   * @param {string} content - The message content
   */
  function addToConversationHistory(role, content) {
    conversationHistory.push({
      role: role,
      content: content
    });
    
    // Keep only the last MAX_HISTORY_LENGTH messages
    if (conversationHistory.length > MAX_HISTORY_LENGTH) {
      conversationHistory = conversationHistory.slice(-MAX_HISTORY_LENGTH);
    }
    
    // Log conversation update without exposing content
    console.log('AI Assistant: Conversation history updated, length:', conversationHistory.length);
    updateMemoryIndicator();
  }
  
  /**
   * Gets the conversation history for sending to the backend
   * @param {string} currentMessage - The current user message
   * @param {string} tier - The user's subscription tier
   * @returns {Array} - Array of message objects for the API
   */
  function buildMessageHistory(currentMessage, tier) {
    // Start with conversation history
    let messages = [...conversationHistory];
    
    // Enhance the current message based on tier
    const enhancedMessage = enhanceMessageForTier(currentMessage, tier);
    
    // Add the current user message
    messages.push({
      role: 'user',
      content: enhancedMessage
    });
    
    // Log message history length without exposing content
    console.log('AI Assistant: Sending message history to backend, message count:', messages.length);
    return messages;
  }
  
  /**
   * Updates the memory indicator display
   */
  function updateMemoryIndicator() {
    const memoryIndicator = document.getElementById('memory-indicator');
    if (!memoryIndicator) return;
    
    const userMessageCount = conversationHistory.filter(msg => msg.role === 'user').length;
    
    if (userMessageCount > 0) {
      memoryIndicator.style.display = 'block';
      memoryIndicator.innerHTML = `
        <i class="fa-solid fa-brain"></i>
        This assistant remembers the last ${userMessageCount} thing${userMessageCount > 1 ? 's' : ''} you said.
        <button class="clear-memory-btn" onclick="clearConversationMemory()">
          <i class="fa-solid fa-trash"></i> Clear Memory
        </button>
      `;
    } else {
      memoryIndicator.style.display = 'none';
    }
  }
  
  /**
   * Clears the conversation history
   */
  function clearConversationMemory() {
    conversationHistory = [];
    updateMemoryIndicator();
    console.log('AI Assistant: Conversation memory cleared');
  }
  
  // Make clearConversationMemory available globally for the button onclick
  window.clearConversationMemory = clearConversationMemory;
  
  /**
   * Determines the user's subscription tier
   * This could be enhanced to get the tier from user authentication,
   * local storage, or URL parameters in a real application
   */
  function getUserSubscriptionTier() {
    // Helper function to capitalize tier names for backend compatibility
    function capitalizeTier(tier) {
      if (!tier) return 'Starter'; // Default fallback
      
      const tierLower = tier.toLowerCase();
      switch (tierLower) {
        case 'starter':
          return 'Starter';
        case 'pro':
          return 'Pro';
        case 'enterprise':
          return 'Enterprise';
        default:
          console.warn('AI Assistant: Unknown tier value:', tier, '- defaulting to Starter');
          return 'Starter';
      }
    }
    
    // Check if tier is stored in localStorage (from previous selection)
    const storedTier = localStorage.getItem('selectedTier');
    if (storedTier) {
      return capitalizeTier(storedTier);
    }
    
    // Check URL parameters for tier
    const urlParams = new URLSearchParams(window.location.search);
    const tierFromUrl = urlParams.get('tier');
    if (tierFromUrl && ['starter', 'pro', 'enterprise'].includes(tierFromUrl.toLowerCase())) {
      return capitalizeTier(tierFromUrl);
    }
    
    // Default to 'Starter' if no tier is specified (capitalized for backend)
    return 'Starter';
  }
  
  /**
   * Enhances the user message based on their subscription tier
   * Pro and Enterprise users get more detailed prompts sent to the backend
   * @param {string} message - The original user message
   * @param {string} tier - The user's subscription tier
   * @returns {string} - The enhanced message
   */
  function enhanceMessageForTier(message, tier) {
    // Starter tier gets basic prompts (no enhancement)
    if (tier === 'Starter') {
      return message;
    }
    
    // Pro and Enterprise tiers get enhanced prompts for better AI responses
    let enhancedMessage = message;
    
    if (tier === 'Pro') {
      enhancedMessage = `As a Pro user asking: "${message}" - Please provide a detailed response with specific examples, actionable steps, and Pro-level insights about TrustBoost AI features. Include relevant metrics, best practices, and advanced usage tips.`;
    } else if (tier === 'Enterprise') {
      enhancedMessage = `As an Enterprise user asking: "${message}" - Please provide a comprehensive, expert-level response with detailed technical information, enterprise-specific features, scalability considerations, integration options, ROI analysis, and advanced strategic insights. Include case studies, implementation guidance, and enterprise best practices for TrustBoost AI.`;
    }
    
    // Log message enhancement without exposing content
    console.log('AI Assistant: Message enhanced for', tier, 'tier');
    return enhancedMessage;
  }
  
  /**
   * Formats the response based on user tier with visual enhancements
   * @param {string} content - The AI response content
   * @param {string} tier - The user's subscription tier
   * @returns {string} - The formatted response HTML
   */
  function formatResponseForTier(content, tier) {
    let formattedContent = content;
    
    // Add tier-specific visual enhancements
    if (tier === 'Pro') {
      formattedContent = `
        <div class="tier-badge pro-badge">
          <i class="fa-solid fa-crown"></i> Pro Response
        </div>
        <div class="response-content pro-response">
          ${content.replace(/\n/g, '<br>')}
        </div>
        <div class="response-footer pro-footer">
          <i class="fa-solid fa-star"></i> Enhanced with Pro-level insights
        </div>
      `;
    } else if (tier === 'Enterprise') {
      formattedContent = `
        <div class="tier-badge enterprise-badge">
          <i class="fa-solid fa-building"></i> Enterprise Response
        </div>
        <div class="response-content enterprise-response">
          ${content.replace(/\n/g, '<br>')}
        </div>
        <div class="response-footer enterprise-footer">
          <i class="fa-solid fa-chart-line"></i> Comprehensive enterprise analysis
          <span class="priority-support">
            <i class="fa-solid fa-headset"></i> Priority Support Available
          </span>
        </div>
      `;
    } else {
      // Starter tier gets basic formatting
      formattedContent = `
        <div class="response-content starter-response">
          ${content.replace(/\n/g, '<br>')}
        </div>
        <div class="response-footer starter-footer">
          <i class="fa-solid fa-arrow-up"></i> 
          <a href="#pricing" style="color: var(--primary); text-decoration: none;">
            Upgrade to Pro for enhanced responses
          </a>
        </div>
      `;
    }
    
    return formattedContent;
  }

  /**
   * Sends a POST request to the backend API
   * @param {string} message - The user's question
   * @param {string} tier - The user's subscription tier
   * @returns {Promise} - The fetch promise
   */
  async function sendMessageToBackend(message, tier) {
    try {
      // Build the message history including conversation context
      const messages = buildMessageHistory(message, tier);
      
      // Construct the exact JSON body structure expected by the backend
      const requestBody = {
        "tier": tier,
        "messages": messages
      };
      
      // Log request initiation without sensitive data
      console.log('AI Assistant: Sending request to backend for tier:', tier);
      
      // Send POST request to backend with the expected JSON structure
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any additional headers your backend might need
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('AI Assistant: Backend response status:', response.status);
      
      // Check if the response is ok (status 200-299)
      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Assistant: Backend error response:', errorText);
        
        // Handle 403 Forbidden specifically
        if (response.status === 403) {
          throw new Error('RATE_LIMIT_EXCEEDED');
        }
        
        throw new Error(`Backend responded with status: ${response.status} ${response.statusText}`);
      }
      
      // Parse the JSON response
      const data = await response.json();
      // Log response status without exposing sensitive data
      console.log('AI Assistant: Backend response received successfully');
      
      // Check for usage limit information in the response
      if (data.usage || data.remaining || data.limit) {
        const remainingMessages = data.remaining || data.usage?.remaining || 0;
        const limit = data.limit || data.usage?.limit || 0;
        const used = data.used || data.usage?.used || 0;
        
        console.log('AI Assistant: Usage info received - remaining:', remainingMessages, 'limit:', limit, 'used:', used);
        
        // Show usage warning if getting close to limit (less than 3 messages remaining)
        if (remainingMessages <= 3 && remainingMessages > 0) {
          setTimeout(() => {
            showUsageLimitMessage(tier, remainingMessages);
          }, 1000); // Show after response is displayed
        }
        
        // Show limit reached message if no messages remaining
        if (remainingMessages === 0) {
          setTimeout(() => {
            showUsageLimitMessage(tier, 0);
          }, 1000);
        }
      }
      
      // Check for usage limit warnings in response messages
      if (data.warning) {
        console.log('AI Assistant: Backend warning received:', data.warning);
        
        // Extract remaining count from warning message if available
        const warningMatch = data.warning.match(/(\d+)\s+messages?\s+remaining/i);
        const remaining = warningMatch ? parseInt(warningMatch[1]) : 1;
        
        setTimeout(() => {
          showUsageLimitMessage(tier, remaining);
        }, 1000);
      }
      
      return data;
      
    } catch (error) {
      // Log the error to console for debugging
      console.error('AI Assistant: Error in sendMessageToBackend:', error);
      // Re-throw the error to be handled by the calling function
      throw error;
    }
  }
  
  /**
   * Creates a typewriter effect for text with enhanced visual feedback
   * @param {HTMLElement} element - The element to type into
   * @param {string} text - The text to type
   * @param {number} speed - Typing speed in milliseconds
   * @returns {Promise} Promise that resolves when typing is complete
   */
  function typeWriter(element, text, speed = 50) {
    return new Promise((resolve) => {
      element.textContent = '';
      let i = 0;
      
      // Add typing cursor and sound indicator
      element.classList.add('typing-text', 'typing');
      
      // Add visual sound indicator
      const soundIndicator = document.createElement('div');
      soundIndicator.className = 'typing-sound-indicator';
      element.style.position = 'relative';
      element.appendChild(soundIndicator);
      
      function type() {
        if (i < text.length) {
          element.textContent = text.substring(0, i + 1);
          i++;
          setTimeout(type, speed);
        } else {
          // Remove cursor and sound indicator after typing completes
          element.classList.remove('typing-text', 'typing');
          if (soundIndicator && soundIndicator.parentNode) {
            soundIndicator.remove();
          }
          resolve();
        }
      }
      
      type();
    });
  }

  /**
   * Shows placeholder response with typing animation
   * @param {string} tier - User's subscription tier
   */
  function showPlaceholderResponse(tier = 'Starter') {
    if (!placeholderResponse || !typingText) return;
    
    // Hide other elements
    responseBox.style.display = 'none';
    
    // Set tier-specific loading content
    const loadingContent = loadingDiv?.querySelector('.loading-content');
    if (loadingContent) {
      loadingContent.className = `loading-content ${tier.toLowerCase()}-tier`;
    }
    
    // Show placeholder
    placeholderResponse.style.display = 'block';
    placeholderResponse.classList.add('show');
    
    // Get tier-specific placeholder text
    const placeholderTexts = {
      'Starter': 'Let me analyze your question and provide a helpful response...',
      'Pro': 'Analyzing your question with enhanced AI capabilities for a comprehensive response...',
      'Enterprise': 'Processing your request with our most advanced AI algorithms and enterprise-level insights...'
    };
    
    const placeholderText = placeholderTexts[tier] || placeholderTexts['Starter'];
    
    // Start typing animation
    typeWriter(typingText, placeholderText, 40);
  }

  /**
   * Hides placeholder response and cleans up typewriter effects
   */
  function hidePlaceholderResponse() {
    if (placeholderResponse) {
      placeholderResponse.style.display = 'none';
      placeholderResponse.classList.remove('show');
    }
    
    // Clean up any typewriter effects
    if (typingText) {
      typingText.classList.remove('typing-text', 'typing');
      typingText.textContent = '';
      
      // Remove any sound indicators
      const soundIndicator = typingText.querySelector('.typing-sound-indicator');
      if (soundIndicator && soundIndicator.parentNode) {
        soundIndicator.remove();
      }
    }
  }

  /**
   * Shows enhanced loading indicator with tier-specific animations
   * @param {string} tier - User's subscription tier
   */
  function showEnhancedLoading(tier = 'Starter') {
    // Hide other elements
    responseBox.style.display = 'none';
    hidePlaceholderResponse();
    
    // Show loading indicator
    if (loadingDiv) {
      const loadingContent = loadingDiv.querySelector('.loading-content');
      if (loadingContent) {
        loadingContent.className = `loading-content ${tier.toLowerCase()}-tier`;
        
        // Update loading text based on tier
        const loadingTextElement = loadingContent.querySelector('.loading-text');
        if (loadingTextElement) {
          const loadingTexts = {
            'Starter': 'AI is analyzing your question...',
            'Pro': 'Pro AI is crafting your enhanced response...',
            'Enterprise': 'Enterprise AI is generating comprehensive insights...'
          };
          loadingTextElement.textContent = loadingTexts[tier] || loadingTexts['Starter'];
        }
      }
      
      loadingDiv.style.display = 'block';
    }
    
    // Show placeholder response after a brief delay
    setTimeout(() => {
      showPlaceholderResponse(tier);
    }, 1200);
  }
  /**
   * Displays the AI response in the response container
   * @param {string} content - The response content to display (may include HTML for tier formatting)
   * @param {string} tier - The user's subscription tier for additional styling
   */
  function displayResponse(content, tier = 'Starter') {
    // Log response display without exposing user content
    console.log('AI Assistant: Displaying response for', tier, 'user');
    
    // Hide loading and placeholder, and clean up any effects
    // hideLoading(); // Function not defined - using hidePlaceholderResponse() instead
    hidePlaceholderResponse();
    
    // Clear any existing content and create clean structure
    responseBox.innerHTML = `
      <div class="ai-response-header">
        <div class="ai-avatar" aria-hidden="true"></div>
        <span>AI Assistant</span>
      </div>
      <div class="ai-response-content"></div>
    `;
    
    // Get the content div and set the text content directly (no HTML processing)
    const responseContent = responseBox.querySelector('.ai-response-content');
    if (responseContent) {
      // Clear any residual classes and simply set the text content
      responseContent.className = 'ai-response-content';
      responseContent.textContent = content;
    }
    
    // Add tier-specific CSS class to response box for styling
    responseBox.className = `ai-assistant-response ${tier.toLowerCase()}-tier`;
    
    // Show the response box with animation
    responseBox.style.display = 'block';
    
    // Scroll to the response for better user experience
    responseBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    console.log('AI Assistant: Response displayed successfully');
  }
  
  /**
   * Displays an error message to the user
   * @param {string} errorMessage - The error message to display
   */
  function displayError(errorMessage) {
    displayResponse(`⚠️ Error: ${errorMessage}. Please try again or contact support if the issue persists.`);
  }
  
  /**
   * Displays a rate limit error message to the user with red styling
   * @param {string} errorMessage - The rate limit error message to display
   */
  function displayRateLimitError(errorMessage) {
    console.log('AI Assistant: Displaying rate limit error:', errorMessage);
    
    // Hide loading and placeholder, and clean up any effects
    // hideLoading(); // Function not defined - using hidePlaceholderResponse() instead
    hidePlaceholderResponse();
    
    // Clear any existing content and create clean structure with error styling
    responseBox.innerHTML = `
      <div class="ai-response-header">
        <div class="ai-avatar" aria-hidden="true"></div>
        <span>AI Assistant</span>
      </div>
      <div class="ai-response-content rate-limit-error"></div>
    `;
    
    // Get the content div and set the error message
    const responseContent = responseBox.querySelector('.ai-response-content');
    if (responseContent) {
      responseContent.textContent = errorMessage;
      // Add red text styling
      responseContent.style.color = '#ef4444';
      responseContent.style.fontWeight = '600';
    }
    
    // Add error-specific CSS class to response box
    responseBox.className = 'ai-assistant-response rate-limit-error';
    
    // Show the response box with animation
    responseBox.style.display = 'block';
    
    // Scroll to the response for better user experience
    responseBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    console.log('AI Assistant: Rate limit error displayed successfully');
  }

  /**
   * Shows a usage limit popup/message below the AI chat area
   * @param {string} tier - User's current tier
   * @param {number} remainingMessages - Number of messages remaining (optional)
   */
  function showUsageLimitMessage(tier = 'Starter', remainingMessages = 0) {
    // Remove any existing usage limit message
    const existingMessage = document.getElementById('usage-limit-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // Create the usage limit message container
    const usageLimitDiv = document.createElement('div');
    usageLimitDiv.id = 'usage-limit-message';
    usageLimitDiv.className = 'usage-limit-popup';
    
    // Set the message content based on tier and remaining messages
    let messageContent = '';
    let upgradeText = '';
    
    if (remainingMessages > 0) {
      messageContent = `
        <div class="usage-warning">
          <i class="fa-solid fa-exclamation-triangle"></i>
          <strong>Usage Warning</strong>
        </div>
        <p>You have <strong>${remainingMessages} message${remainingMessages > 1 ? 's' : ''}</strong> remaining on your ${tier} plan.</p>
      `;
      
      if (tier === 'Starter') {
        upgradeText = '<a href="#pricing" class="upgrade-link">Upgrade to Pro</a> for unlimited messages and enhanced features.';
      } else if (tier === 'Pro') {
        upgradeText = '<a href="#pricing" class="upgrade-link">Upgrade to Enterprise</a> for unlimited enterprise features.';
      }
    } else {
      messageContent = `
        <div class="usage-limit-reached">
          <i class="fa-solid fa-ban"></i>
          <strong>Usage Limit Reached</strong>
        </div>
        <p>You've reached your ${tier} plan's message limit for this period.</p>
      `;
      
      if (tier === 'Starter') {
        upgradeText = '<a href="#pricing" class="upgrade-link">Upgrade to Pro</a> for unlimited messages and enhanced AI features.';
      } else if (tier === 'Pro') {
        upgradeText = '<a href="#pricing" class="upgrade-link">Upgrade to Enterprise</a> for unlimited enterprise-level features.';
      } else {
        upgradeText = 'Contact support for Enterprise plan adjustments.';
      }
    }
    
    usageLimitDiv.innerHTML = `
      ${messageContent}
      <div class="upgrade-suggestion">
        ${upgradeText}
      </div>
      <button class="close-usage-message" onclick="closeUsageLimitMessage()">
        <i class="fa-solid fa-times"></i>
      </button>
    `;
    
    // Insert the message below the AI chat area
    const aiAssistantSection = document.querySelector('.ai-assistant');
    const responseBox = document.getElementById('response-box');
    
    if (aiAssistantSection && responseBox) {
      // Insert after the response box
      responseBox.parentNode.insertBefore(usageLimitDiv, responseBox.nextSibling);
    } else if (aiAssistantSection) {
      // Fallback: append to AI assistant section
      aiAssistantSection.appendChild(usageLimitDiv);
    }
    
    // Animate the message in
    setTimeout(() => {
      usageLimitDiv.classList.add('show');
    }, 100);
    
    // Auto-hide warning messages after 10 seconds (not limit reached messages)
    if (remainingMessages > 0) {
      setTimeout(() => {
        closeUsageLimitMessage();
      }, 10000);
    }
    
    console.log('AI Assistant: Usage limit message displayed for', tier, 'tier, remaining:', remainingMessages);
  }

  /**
   * Closes the usage limit message
   */
  function closeUsageLimitMessage() {
    const usageLimitMessage = document.getElementById('usage-limit-message');
    if (usageLimitMessage) {
      usageLimitMessage.classList.add('hide');
      setTimeout(() => {
        usageLimitMessage.remove();
      }, 300);
    }
  }

  // Make the close function globally available
  window.closeUsageLimitMessage = closeUsageLimitMessage;

  /**
   * Main form submission handler
   */
  async function handleFormSubmission(event) {
    // Prevent the default form submission
    event.preventDefault();
    
    // Prevent duplicate requests if one is already pending
    if (isRequestPending) {
      console.log('AI Assistant: Request already pending, ignoring duplicate submission');
      return;
    }
    
    // Get the user's message and trim whitespace
    const message = userInput.value.trim();
    
    // Validate that the message is not empty
    if (!message) {
      userInput.focus();
      return;
    }
    
    // Get the user's subscription tier
    const userTier = getUserSubscriptionTier();
    console.log('AI Assistant: Tier being sent to backend:', userTier);
    
    // Check Starter plan message limit before processing
    if (userTier === 'Starter' && hasReachedStarterLimit()) {
      console.log('AI Assistant: Starter plan user has reached message limit');
      
      // Show limit reached message
      showUsageLimitMessage('Starter', 0);
      
      // Clear input and reset button state
      userInput.value = '';
      
      return; // Stop processing
    }
    
    // Disable buttons to prevent duplicate submissions
    disableSubmissionButtons();
    
    // Update UI to show loading state with tier-specific enhancements
    showEnhancedLoading(userTier);
    
    try {
      // Send the message to the backend
      console.log('AI Assistant: Sending message to backend for tier:', userTier);
      
      // Add the original user message to conversation history
      addToConversationHistory('user', message);
      
      const responseData = await sendMessageToBackend(message, userTier);
      
      // Parse the response based on your backend's response structure
      // Common response structures to handle:
      let aiResponse;
      
      if (responseData.choices && responseData.choices[0] && responseData.choices[0].message) {
        // OpenAI-style response format
        aiResponse = responseData.choices[0].message.content;
      } else if (responseData.response) {
        // Simple response field
        aiResponse = responseData.response;
      } else if (responseData.message) {
        // Message field
        aiResponse = responseData.message;
      } else if (responseData.content) {
        // Content field
        aiResponse = responseData.content;
      } else if (responseData.assistant) {
        // Assistant field
        aiResponse = responseData.assistant;
      } else if (typeof responseData === 'string') {
        // Direct string response
        aiResponse = responseData;
      } else {
        // Fallback: stringify the entire response
        console.warn('AI Assistant: Unexpected response format - using fallback');
        aiResponse = JSON.stringify(responseData, null, 2);
      }
      
      // Log response extraction without exposing content
      console.log('AI Assistant: AI response extracted successfully');
      
      // Add the AI response to conversation history (store the original, not formatted version)
      addToConversationHistory('assistant', aiResponse || 'Response received successfully!');
      
      // Add a slight delay for better UX transition from placeholder to response
      setTimeout(() => {
        // Display the AI's response directly without tier formatting to prevent corruption
        displayResponse(aiResponse || 'Response received successfully!', userTier);
        
        // Clear the input field after successful submission
        userInput.value = '';
        
        // Re-enable submission buttons
        enableSubmissionButtons();
        
        // Increment message count for Starter plan users
        if (userTier === 'Starter') {
          incrementSessionMessageCount();
          const currentCount = getSessionMessageCount();
          console.log('AI Assistant: Starter plan message count incremented to:', currentCount);

          // Force re-check usage from backend (bypass cache) to decide if banner should now show
           checkStarterUsageAndShowBanner(true);
          
          // Show warning if approaching limit
          if (currentCount >= STARTER_MESSAGE_LIMIT) {
            setTimeout(() => {
              showUsageLimitMessage('Starter', 0);
            }, 2000); // Show after response is fully displayed
          } else if (currentCount === STARTER_MESSAGE_LIMIT - 1) {
            setTimeout(() => {
              showUsageLimitMessage('Starter', 1);
            }, 2000); // Show warning for last message
          }
        }
        
        // Reset button state
        // updateSubmitButton(false); // Function not defined - removed to prevent ReferenceError
        
        // Log success for debugging
        console.log('AI Assistant: Response processed and displayed successfully');
      }, 500); // Small delay for smoother transition
      
    } catch (error) {
      // Handle different types of errors with detailed console logging
      console.error('AI Assistant: Error occurred during request:', error);
      console.error('AI Assistant: Error name:', error.name);
      console.error('AI Assistant: Error message:', error.message);
      console.error('AI Assistant: Error stack:', error.stack);
      
      let errorMessage = 'Unable to get AI response';
      
      // Provide specific error messages based on error type
      if (error.message === 'RATE_LIMIT_EXCEEDED') {
        errorMessage = "You've reached the message limit for your current plan. Please upgrade to continue.";
        console.error('AI Assistant: Rate limit exceeded (403)');
        // Display this as a special rate limit error with red styling
        displayRateLimitError(errorMessage);
        // Re-enable buttons even for rate limit errors
        enableSubmissionButtons();
        return; // Exit early to use special error display
      } else if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        errorMessage = 'Network error - please check your internet connection';
        console.error('AI Assistant: Network connection failed');
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error - our AI is temporarily unavailable';
        console.error('AI Assistant: Backend server error (500)');
      } else if (error.message.includes('400')) {
        errorMessage = 'Invalid request - please try rephrasing your question';
        console.error('AI Assistant: Bad request error (400)');
      } else if (error.message.includes('404')) {
        errorMessage = 'API endpoint not found - please contact support';
        console.error('AI Assistant: API endpoint not found (404)');
      } else if (error.message.includes('tier')) {
        errorMessage = 'Subscription tier issue - please contact support';
        console.error('AI Assistant: Tier-related error');
      } else {
        console.error('AI Assistant: Unknown error type:', error);
      }
      
      displayError(errorMessage);
      
    } finally {
      // Always restore the submit button state and re-enable buttons
      enableSubmissionButtons();
      // hideLoading(); // Function not defined - cleanup handled by displayResponse/displayError functions
    }
  }
  
  // Add event listener for form submission
  form.addEventListener('submit', handleFormSubmission);
  
  // Handle question suggestion clicks - ensure this runs after DOM is ready
  setTimeout(() => {
    const suggestionButtons = document.querySelectorAll('.suggestion-btn');
    console.log('AI Assistant: Found', suggestionButtons.length, 'suggestion buttons');
    
    suggestionButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Prevent clicking if a request is already pending
        if (isRequestPending) {
          console.log('AI Assistant: Request already pending, ignoring suggestion button click');
          return;
        }
        
        const question = this.getAttribute('data-question');
        console.log('AI Assistant: Suggestion button clicked:', question);
        
        if (question) {
          // Add visual feedback - briefly highlight the clicked button
          this.style.background = 'rgba(108, 71, 255, 0.2)';
          this.style.transform = 'scale(0.98)';
          
          // Reset the visual feedback after a short delay
          setTimeout(() => {
            this.style.background = '';
            this.style.transform = '';
          }, 150);
          
          // Fill the input with the suggested question
          userInput.value = question;
          
          // Auto-resize the textarea to fit the content
          userInput.style.height = 'auto';
          userInput.style.height = Math.min(userInput.scrollHeight, 200) + 'px';
          
          // Focus the input for better UX
          userInput.focus();
          
          // Set cursor to end of text
          userInput.setSelectionRange(userInput.value.length, userInput.value.length);
          
          // Auto-submit the question for immediate response
          setTimeout(() => {
            console.log('AI Assistant: Auto-submitting suggestion question');
            form.dispatchEvent(new Event('submit'));
          }, 200); // Small delay for better UX
          
          console.log('AI Assistant: Question suggestion selected and submitted:', question);
        }
      });
    });
  }, 100);
  
  // Handle Enter key in textarea (Submit on Enter, new line on Shift+Enter)
  userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      // Prevent submission if a request is already pending
      if (isRequestPending) {
        event.preventDefault();
        console.log('AI Assistant: Request already pending, ignoring Enter key submission');
        return;
      }
      
      event.preventDefault();
      form.dispatchEvent(new Event('submit'));
    }
  });
  
  // Auto-resize textarea as user types
  userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 200) + 'px';
  });
  
  // Store the selected tier when user clicks on pricing buttons
  // This helps maintain context for the AI assistant
  document.addEventListener('click', function(event) {
    if (event.target.matches('[data-plan]')) {
      const selectedTier = event.target.getAttribute('data-plan');
      // Store the tier as-is from HTML (lowercase), capitalization handled in getUserSubscriptionTier()
      localStorage.setItem('selectedTier', selectedTier);
      console.log('AI Assistant: User selected tier (stored):', selectedTier);
      console.log('AI Assistant: Tier will be sent to backend as:', getUserSubscriptionTier());
    }
  });
  
  // Initialize memory indicator
  updateMemoryIndicator();
  
  console.log('AI Assistant: Initialized successfully with backend integration and conversation memory');
}

// === Admin Keyboard Shortcuts ===
function initAdminKeyboardShortcuts() {
  document.addEventListener('keydown', function(event) {
    // Check for Ctrl+Shift+A (Windows/Linux) or Cmd+Shift+A (Mac)
    if (event.shiftKey && 
        event.key.toLowerCase() === 'a' && 
        (event.ctrlKey || event.metaKey)) {
      
      event.preventDefault();
      
      // Navigate to admin dashboard
      window.location.href = 'admin.html';
      
      console.log('Admin: Keyboard shortcut activated - navigating to admin dashboard');
    }
  });
  
  console.log('Admin: Keyboard shortcuts initialized (Ctrl/Cmd+Shift+A)');
}

// === Main initialization ===
document.addEventListener("DOMContentLoaded", function() {
  console.log('TrustBoost AI: Initializing application...');
  
  // Add styles first
  addAriaLiveStyles();
  
  // Initialize all components

  initThemeToggle();
  initMobileNav();
  initSmoothScroll();
  initPricingToggle();
  initTestimonialsCarousel();
  initFormHandlers();
  initAIAssistant();
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
  
  // Initialize mobile optimizations
  initMobileOptimizations();
  
  // Initialize enhanced mobile navigation
  initEnhancedMobileNav();
  
  // Initialize AI assistant
  initAIAssistant();
  
  // Initialize admin keyboard shortcuts
  initAdminKeyboardShortcuts();
  
  console.log('TrustBoost AI: Application initialized successfully!');
});