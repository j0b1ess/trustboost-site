// TrustBoost AI Frontend App Logic
// Author: Copilot
// Version: 1.0.0

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

Object.entries(lottieFiles).forEach(([id, path]) => {
  const el = document.getElementById(id);
  if (el && window.lottie) {
    try {
      lottie.loadAnimation({
        container: el,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path
      });
    } catch(e) {
      el.innerHTML = '<div style="font-size:13px;color:#999;">Animation failed to load.</div>';
    }
  }
});

// === Animate hero stats ===

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".stat-num").forEach(el => {
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
});

// === Theme Toggle ===

const themeBtn = document.getElementById("theme-toggle");
if (themeBtn) {
  themeBtn.addEventListener("click", ()=> {
    document.body.classList.toggle("dark");
    themeBtn.innerHTML = document.body.classList.contains("dark")
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  });
}

// === Mobile Nav Toggle ===

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

// === Smooth scroll and focus for anchor links + skip ===
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

// === Pricing Toggle ===

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

// === Testimonials Carousel (fully functional, accessible, ARIA live, keyboard, mouse, touch) ===
// Carousel state
const testimonialsEls = Array.from(document.querySelectorAll('.testimonial'));
const carousel = document.getElementById('testimonials-carousel');
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
  if (announce) {
    const msg = testimonialsEls[idx].querySelector('p').innerText;
    setAriaLive(msg);
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

document.getElementById('testimonial-next').onclick = nextTestimonial;
document.getElementById('testimonial-prev').onclick = prevTestimonial;

carousel.addEventListener('keydown', function(e) {
  if (e.key === "ArrowRight") { nextTestimonial(); e.preventDefault(); }
  if (e.key === "ArrowLeft") { prevTestimonial(); e.preventDefault(); }
  if (e.key === "Home") { goToTestimonial(0); e.preventDefault(); }
  if (e.key === "End") { goToTestimonial(testimonialsEls.length-1); e.preventDefault(); }
});

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

function startAutoAdvance() {
  if (autoAdvanceTimer) clearInterval(autoAdvanceTimer);
  autoAdvanceTimer = setInterval(() => {
    if (!isPaused && window.innerWidth > 700) nextTestimonial();
  }, 6000);
}
carousel.addEventListener('mouseenter', () => isPaused = true);
carousel.addEventListener('mouseleave', () => isPaused = false);
carousel.addEventListener('focusin', () => isPaused = true);
carousel.addEventListener('focusout', () => isPaused = false);

testimonialsEls.forEach((el, idx) => {
  el.addEventListener('click', () => { goToTestimonial(idx); });
  el.addEventListener('focus', () => { goToTestimonial(idx); });
});

updateTestimonial(0);
startAutoAdvance();

// === LANGUAGES: FULL TRANSLATIONS OBJECT AND TOGGLE ===
const translations = { /* ... your translations object as above ... */ };

const langToggle = document.getElementById("lang-toggle");
if (langToggle) {
  langToggle.addEventListener("change", function() {
    const lang = this.value;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      let txt = (translations[lang] && translations[lang][key]) || (translations["en"] && translations["en"][key]);
      if (txt) {
        if (el.tagName === "INPUT" && el.type === "submit") {
          el.value = txt;
        } else if (el.tagName === "INPUT" && el.hasAttribute("placeholder")) {
          el.setAttribute("placeholder", txt);
        } else if (el.tagName === "BUTTON") {
          el.textContent = txt;
        } else {
          el.innerHTML = txt;
        }
      }
    });
    tIndex = 0;
    updateTestimonial(0, false);
  });
}

// === Newsletter, Contact Form, Stripe Demo (Accessibility) ===
const contactForm = document.querySelector('.contact-form form');
if (contactForm) contactForm.addEventListener('submit', function(e) {
  setAriaLive('Thank you for contacting us! We will get back to you soon.');
});
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) newsletterForm.addEventListener('submit', function(e) {
  setAriaLive('Thank you for subscribing to the newsletter!');
});

// === Skip Link accessibility ===
const skipLink = document.getElementById('skip-link');
if (skipLink) {
  skipLink.addEventListener('focus', () => skipLink.classList.add('visible'));
  skipLink.addEventListener('blur', () => skipLink.classList.remove('visible'));
}

// === Focus management for section navigation ===
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

// === Utility: visually-hidden class for ARIA live ===
(function(){
  const style = document.createElement('style');
  style.textContent = `.visually-hidden{position:absolute!important;height:1px;width:1px;overflow:hidden;clip:rect(1px,1px,1px,1px);white-space:nowrap}`;
  document.head.appendChild(style);
})();

// === Stripe Checkout Price ID Map & Dynamic Logic ===

const stripePriceMap = {
  starter: {
    monthly: 'price_1RfmhMPJRBEcEiwCd4redXTe',
    yearly:  'price_1Rfmk8PJRBEcEiwCNtXmGhr3'
  },
  pro: {
    monthly: 'price_1RfmiJPJRBEcEiwCbTTCuQWv',
    yearly:  'price_1RfmkrPJRBEcEiwCUjNT9NE9'
  },
  enterprise: {
    monthly: 'price_1RfmjHPJRBEcEiwCN0LlMdWO',
    yearly:  'price_1RfmlYPJRBEcEiwCR4c2kgMO'
  }
};

// Stripe publishable key (provided by you)
const stripePublishableKey = 'pk_test_51RfmdIPJRBEcEiwCkYcSTkfT8Ct6sbQc14uED5hxNHbn80tkzdeV2A45ruhjFaTB45q5a9ypMLuiw1S7Z5c99G2r00QnKeOwyV';

// On DOMContentLoaded, attach checkout button handlers
document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll('.pricing-card .btn, .pricing-card.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const card = btn.closest('.pricing-card');
      let plan = 'starter';
      if (card) {
        if (card.classList.contains('popular')) plan = 'pro';
        else if (card.querySelector('h3') && /enterprise/i.test(card.querySelector('h3').innerText)) plan = 'enterprise';
        else plan = 'starter';
      }
      let period = 'monthly';
      const billingToggle = document.getElementById("billing-toggle");
      if (billingToggle && billingToggle.checked) period = "yearly";
      launchStripeCheckout(plan, period);
    });
  });
});

// Stripe Checkout logic
function launchStripeCheckout(plan, period) {
  const priceId = stripePriceMap[plan][period];
  if (!priceId) {
    alert('Invalid plan or billing period selected.');
    return;
  }
  if (window.Stripe) {
    const stripe = window.Stripe(stripePublishableKey);
    stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      successUrl: window.location.origin + '/success',
      cancelUrl: window.location.origin + '/cancel'
    }).then(function(result) {
      if (result.error) alert(result.error.message);
    });
  } else {
    window.open('https://buy.stripe.com/test_dR6eVA4V3aH2fAAcMM', '_blank');
  }
}