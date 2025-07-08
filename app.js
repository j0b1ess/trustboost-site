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
const translations = {
  en: {
    "nav.features": "Features",
    "nav.pricing": "Pricing",
    "nav.testimonials": "Testimonials",
    "nav.contact": "Contact",
    "nav.cta": "Start Free",
    "hero.title1": "Grow Your Reputation",
    "hero.title2": "Effortlessly, With AI",
    "hero.subtitle": "Win more reviews, delight your customers, and dominate local search results – all from one playful, powerful dashboard.",
    "hero.cta1": "Start Free Trial",
    "hero.cta2": "See How It Works",
    "hero.stat1": "5-Star Reviews",
    "hero.stat2": "Avg. Google Rank Boost",
    "features.title": "What Makes Us Different",
    "features.automated": "Automated Review Requests",
    "features.automated-desc": "Send beautiful, personalized review requests via email or SMS in a single click. No chasing, just results.",
    "features.ai": "AI-Powered Replies",
    "features.ai-desc": "Copy-paste any review, get a dazzling, on-brand response instantly – and boost customer happiness.",
    "features.seo": "SEO Booster",
    "features.seo-desc": "Weekly Google posts, AI-written and scheduled for you. Outrank the competition while you sleep.",
    "features.analytics": "Live Analytics",
    "features.analytics-desc": "Animated dashboards: see your review growth, SEO ranking, and more – always up to date.",
    "pricing.title": "Simple, Honest Pricing",
    "pricing.monthly": "Monthly",
    "pricing.yearly": "Yearly",
    "pricing.interval": "/mo",
    "pricing.starter1": "Automated Review Requests",
    "pricing.starter2": "Basic Analytics",
    "pricing.starter3": "Email Support",
    "pricing.pro1": "AI Review Replies",
    "pricing.pro2": "SEO Automation",
    "pricing.pro3": "Advanced Analytics",
    "pricing.pro4": "Priority Support",
    "pricing.ent1": "Unlimited Locations",
    "pricing.ent2": "Custom Integrations",
    "pricing.ent3": "Dedicated Manager",
    "pricing.ent4": "Custom Onboarding",
    "pricing.cta": "Select",
    "pricing.popular": "Most Popular",
    "testimonials.title": "What Our Customers Say",
    "testimonials.t1": "TrustBoost made getting reviews so easy—now we get 10x more, and customers love our replies!",
    "testimonials.t2": "We show up #1 on Google Maps now, and the analytics are so fun and clear!",
    "testimonials.t3": "The AI responses are better than what I’d write. My team saves hours every week!",
    "cta.title": "Ready to Boost Your Trust?",
    "cta.cta": "Start My Free Trial",
    "contact.title": "Contact Us",
    "contact.submit": "Send Message",
    "newsletter.title": "Join Our Newsletter",
    "newsletter.cta": "Subscribe",
    "newsletter.desc": "Get tips, tricks & growth hacks—no spam.",
    "checkout.title": "Secure Stripe Checkout",
    "checkout.note": "Powered by <b>Stripe</b>—trusted by millions."
    // ...add all other keys for all languages...
  },
  zh: {
    "nav.features": "功能",
    "nav.pricing": "价格",
    "nav.testimonials": "推荐",
    "nav.contact": "联系",
    "nav.cta": "免费开始",
    "hero.title1": "提升您的声誉",
    "hero.title2": "轻松，借助AI",
    "hero.subtitle": "赢得更多评价，让客户满意，主导本地搜索结果——一切尽在一个有趣强大的仪表盘。",
    "hero.cta1": "免费试用",
    "hero.cta2": "了解如何运作",
    "hero.stat1": "五星好评",
    "hero.stat2": "平均谷歌排名提升",
    "features.title": "我们的不同之处",
    "features.automated": "自动评价请求",
    "features.automated-desc": "通过电子邮件或短信一键发送美观、个性化的评价请求。无需催促，只需结果。",
    "features.ai": "AI驱动回复",
    "features.ai-desc": "复制粘贴任何评价，立即获得令人惊艳、符合品牌的回复——提升客户满意度。",
    "features.seo": "SEO助推器",
    "features.seo-desc": "每周谷歌帖子，由AI撰写并为您安排。让您在睡觉时超越竞争对手。",
    "features.analytics": "实时分析",
    "features.analytics-desc": "动画仪表盘：查看您的评价增长、SEO排名等——始终保持最新。",
    "pricing.title": "简单、诚实的定价",
    "pricing.monthly": "月付",
    "pricing.yearly": "年付",
    "pricing.interval": "/月",
    "pricing.starter1": "自动评价请求",
    "pricing.starter2": "基础分析",
    "pricing.starter3": "邮件支持",
    "pricing.pro1": "AI评价回复",
    "pricing.pro2": "SEO自动化",
    "pricing.pro3": "高级分析",
    "pricing.pro4": "优先支持",
    "pricing.ent1": "无限地点",
    "pricing.ent2": "自定义集成",
    "pricing.ent3": "专属经理",
    "pricing.ent4": "定制入职",
    "pricing.cta": "选择",
    "pricing.popular": "最受欢迎",
    "testimonials.title": "客户怎么说",
    "testimonials.t1": "TrustBoost让获取评价变得如此简单——现在我们获得的评价多了10倍，客户也喜欢我们的回复！",
    "testimonials.t2": "我们现在在谷歌地图上排名第一，分析也非常有趣且清晰！",
    "testimonials.t3": "AI回复比我写得还好。我的团队每周节省了数小时！",
    "cta.title": "准备好提升信任了吗？",
    "cta.cta": "开始我的免费试用",
    "contact.title": "联系我们",
    "contact.submit": "发送信息",
    "newsletter.title": "订阅我们的通讯",
    "newsletter.cta": "订阅",
    "newsletter.desc": "获取技巧、窍门和增长秘籍——绝无垃圾邮件。",
    "checkout.title": "安全Stripe结账",
    "checkout.note": "由<b>Stripe</b>提供支持——数百万人信赖。"
  },
  hi: {
    "nav.features": "विशेषताएँ",
    "nav.pricing": "मूल्य निर्धारण",
    "nav.testimonials": "प्रशंसापत्र",
    "nav.contact": "संपर्क करें",
    "nav.cta": "फ्री शुरू करें",
    "hero.title1": "अपनी प्रतिष्ठा बढ़ाएँ",
    "hero.title2": "आसान, AI के साथ",
    "hero.subtitle": "अधिक समीक्षाएँ पाएं, अपने ग्राहकों को खुश करें, और स्थानीय खोज में आगे रहें – सब कुछ एक मज़ेदार, शक्तिशाली डैशबोर्ड से।",
    "hero.cta1": "फ्री ट्रायल शुरू करें",
    "hero.cta2": "कैसे काम करता है देखें",
    "hero.stat1": "5-स्टार समीक्षाएँ",
    "hero.stat2": "औसत गूगल रैंक बूस्ट",
    "features.title": "हमें अलग क्या बनाता है",
    "features.automated": "स्वचालित समीक्षा अनुरोध",
    "features.automated-desc": "ईमेल या एसएमएस के माध्यम से सुंदर, व्यक्तिगत समीक्षा अनुरोध एक क्लिक में भेजें। कोई पीछा नहीं, सिर्फ परिणाम।",
    "features.ai": "AI-संचालित उत्तर",
    "features.ai-desc": "कोई भी समीक्षा कॉपी-पेस्ट करें, तुरंत शानदार, ब्रांडेड उत्तर पाएं – और ग्राहक खुशी बढ़ाएं।",
    "features.seo": "SEO बूस्टर",
    "features.seo-desc": "साप्ताहिक गूगल पोस्ट, AI द्वारा लिखित और आपके लिए शेड्यूल। सोते समय प्रतिस्पर्धा को पछाड़ें।",
    "features.analytics": "लाइव एनालिटिक्स",
    "features.analytics-desc": "एनिमेटेड डैशबोर्ड: अपनी समीक्षा वृद्धि, SEO रैंकिंग आदि देखें – हमेशा अपडेटेड。",
    "pricing.title": "सरल, ईमानदार मूल्य निर्धारण",
    "pricing.monthly": "मासिक",
    "pricing.yearly": "वार्षिक",
    "pricing.interval": "/माह",
    "pricing.starter1": "स्वचालित समीक्षा अनुरोध",
    "pricing.starter2": "बेसिक एनालिटिक्स",
    "pricing.starter3": "ईमेल समर्थन",
    "pricing.pro1": "AI समीक्षा उत्तर",
    "pricing.pro2": "SEO ऑटोमेशन",
    "pricing.pro3": "एडवांस्ड एनालिटिक्स",
    "pricing.pro4": "प्राथमिकता समर्थन",
    "pricing.ent1": "असीमित स्थान",
    "pricing.ent2": "कस्टम इंटीग्रेशन",
    "pricing.ent3": "समर्पित प्रबंधक",
    "pricing.ent4": "कस्टम ऑनबोर्डिंग",
    "pricing.cta": "चुनें",
    "pricing.popular": "सबसे लोकप्रिय",
    "testimonials.title": "हमारे ग्राहक क्या कहते हैं",
    "testimonials.t1": "TrustBoost से समीक्षाएँ प्राप्त करना बहुत आसान हो गया—अब हमें 10x अधिक मिलती हैं, और ग्राहक हमारे उत्तर पसंद करते हैं!",
    "testimonials.t2": "अब हम Google Maps पर #1 हैं, और एनालिटिक्स बहुत मज़ेदार और स्पष्ट हैं!",
    "testimonials.t3": "AI उत्तर मुझसे बेहतर हैं। मेरी टीम हर हफ्ते घंटों बचाती है!",
    "cta.title": "क्या आप अपनी विश्वसनीयता बढ़ाने के लिए तैयार हैं?",
    "cta.cta": "मेरा फ्री ट्रायल शुरू करें",
    "contact.title": "हमसे संपर्क करें",
    "contact.submit": "संदेश भेजें",
    "newsletter.title": "हमारा न्यूज़लेटर जॉइन करें",
    "newsletter.cta": "सब्सक्राइब करें",
    "newsletter.desc": "टिप्स, ट्रिक्स और ग्रोथ हैक्स पाएं—कोई स्पैम नहीं।",
    "checkout.title": "सुरक्षित Stripe चेकआउट",
    "checkout.note": "<b>Stripe</b> द्वारा संचालित—करोड़ों द्वारा विश्वसनीय।"
  },
  es: {
    "nav.features": "Características",
    "nav.pricing": "Precios",
    "nav.testimonials": "Testimonios",
    "nav.contact": "Contacto",
    "nav.cta": "Comenzar gratis",
    "hero.title1": "Haz crecer tu reputación",
    "hero.title2": "Sin esfuerzo, con IA",
    "hero.subtitle": "Consigue más reseñas, deleita a tus clientes y domina los resultados de búsqueda locales, todo desde un panel divertido y potente.",
    "hero.cta1": "Comenzar prueba gratis",
    "hero.cta2": "Ver cómo funciona",
    "hero.stat1": "Reseñas de 5 estrellas",
    "hero.stat2": "Prom. aumento de ranking en Google",
    "features.title": "¿Qué nos hace diferentes?",
    "features.automated": "Solicitudes de reseñas automatizadas",
    "features.automated-desc": "Envía solicitudes de reseñas personalizadas por email o SMS con un solo clic. Sin perseguir, solo resultados.",
    "features.ai": "Respuestas impulsadas por IA",
    "features.ai-desc": "Copia y pega cualquier reseña, obtén una respuesta brillante y acorde a tu marca al instante – y aumenta la satisfacción del cliente.",
    "features.seo": "Impulsor de SEO",
    "features.seo-desc": "Publicaciones semanales en Google, escritas por IA y programadas para ti. Supera a la competencia mientras duermes.",
    "features.analytics": "Analítica en vivo",
    "features.analytics-desc": "Paneles animados: ve el crecimiento de tus reseñas, ranking SEO y más – siempre actualizado.",
    "pricing.title": "Precios simples y honestos",
    "pricing.monthly": "Mensual",
    "pricing.yearly": "Anual",
    "pricing.interval": "/mes",
    "pricing.starter1": "Solicitudes de reseñas automatizadas",
    "pricing.starter2": "Analítica básica",
    "pricing.starter3": "Soporte por email",
    "pricing.pro1": "Respuestas de reseñas IA",
    "pricing.pro2": "Automatización SEO",
    "pricing.pro3": "Analítica avanzada",
    "pricing.pro4": "Soporte prioritario",
    "pricing.ent1": "Ubicaciones ilimitadas",
    "pricing.ent2": "Integraciones personalizadas",
    "pricing.ent3": "Gerente dedicado",
    "pricing.ent4": "Onboarding personalizado",
    "pricing.cta": "Seleccionar",
    "pricing.popular": "Más popular",
    "testimonials.title": "Lo que dicen nuestros clientes",
    "testimonials.t1": "¡TrustBoost hizo que conseguir reseñas fuera muy fácil—ahora recibimos 10 veces más y a los clientes les encantan nuestras respuestas!",
    "testimonials.t2": "¡Ahora aparecemos #1 en Google Maps y la analítica es divertida y clara!",
    "testimonials.t3": "Las respuestas de IA son mejores que las que yo escribiría. ¡Mi equipo ahorra horas cada semana!",
    "cta.title": "¿Listo para aumentar tu confianza?",
    "cta.cta": "Comenzar mi prueba gratis",
    "contact.title": "Contáctanos",
    "contact.submit": "Enviar mensaje",
    "newsletter.title": "Únete a nuestro boletín",
    "newsletter.cta": "Suscribirse",
    "newsletter.desc": "Recibe consejos, trucos y hacks de crecimiento—sin spam.",
    "checkout.title": "Pago seguro con Stripe",
    "checkout.note": "Impulsado por <b>Stripe</b>—confiado por millones."
  },
  ar: {
    "nav.features": "الميزات",
    "nav.pricing": "الأسعار",
    "nav.testimonials": "الشهادات",
    "nav.contact": "اتصل بنا",
    "nav.cta": "ابدأ مجانًا",
    "hero.title1": "نمِ سمعتك",
    "hero.title2": "بسهولة، مع الذكاء الاصطناعي",
    "hero.subtitle": "احصل على المزيد من التقييمات، وأسعد عملاءك، وتصدر نتائج البحث المحلية – كل ذلك من لوحة تحكم ممتعة وقوية.",
    "hero.cta1": "ابدأ التجربة المجانية",
    "hero.cta2": "شاهد كيف يعمل",
    "hero.stat1": "تقييمات 5 نجوم",
    "hero.stat2": "متوسط زيادة ترتيب جوجل",
    "features.title": "ما الذي يميزنا",
    "features.automated": "طلبات تقييم تلقائية",
    "features.automated-desc": "أرسل طلبات تقييم جميلة وشخصية عبر البريد الإلكتروني أو الرسائل بنقرة واحدة. لا حاجة للملاحقة، فقط النتائج.",
    "features.ai": "ردود مدعومة بالذكاء الاصطناعي",
    "features.ai-desc": "انسخ أي تقييم، واحصل على رد رائع ومتوافق مع علامتك التجارية فورًا – وزد رضا العملاء.",
    "features.seo": "معزز SEO",
    "features.seo-desc": "منشورات جوجل أسبوعية، مكتوبة بالذكاء الاصطناعي ومجدولة لك. تفوق على المنافسين أثناء نومك.",
    "features.analytics": "تحليلات مباشرة",
    "features.analytics-desc": "لوحات تحكم متحركة: شاهد نمو تقييماتك، وترتيب SEO والمزيد – دائمًا محدث.",
    "pricing.title": "أسعار بسيطة وصادقة",
    "pricing.monthly": "شهري",
    "pricing.yearly": "سنوي",
    "pricing.interval": "/شهر",
    "pricing.starter1": "طلبات تقييم تلقائية",
    "pricing.starter2": "تحليلات أساسية",
    "pricing.starter3": "دعم عبر البريد",
    "pricing.pro1": "ردود تقييمات الذكاء الاصطناعي",
    "pricing.pro2": "أتمتة SEO",
    "pricing.pro3": "تحليلات متقدمة",
    "pricing.pro4": "دعم أولوية",
    "pricing.ent1": "مواقع غير محدودة",
    "pricing.ent2": "تكاملات مخصصة",
    "pricing.ent3": "مدير مخصص",
    "pricing.ent4": "إعداد مخصص",
    "pricing.cta": "اختر",
    "pricing.popular": "الأكثر شعبية",
    "testimonials.title": "ماذا يقول عملاؤنا",
    "testimonials.t1": "جعلت TrustBoost الحصول على التقييمات سهلاً للغاية—الآن نحصل على 10 أضعاف، والعملاء يحبون ردودنا!",
    "testimonials.t2": "نظهر الآن رقم 1 على خرائط جوجل، والتحليلات ممتعة وواضحة!",
    "testimonials.t3": "ردود الذكاء الاصطناعي أفضل مما أكتبه. فريقي يوفر ساعات كل أسبوع!",
    "cta.title": "هل أنت مستعد لتعزيز الثقة؟",
    "cta.cta": "ابدأ تجربتي المجانية",
    "contact.title": "اتصل بنا",
    "contact.submit": "إرسال الرسالة",
    "newsletter.title": "انضم إلى نشرتنا البريدية",
    "newsletter.cta": "اشترك",
    "newsletter.desc": "احصل على نصائح وحيل ونمو—بدون رسائل مزعجة.",
    "checkout.title": "دفع آمن عبر Stripe",
    "checkout.note": "مدعوم من <b>Stripe</b>—موثوق به من قبل الملايين."
  }
};

// Language toggle logic
document.addEventListener("DOMContentLoaded", function() {
  const langToggle = document.getElementById("lang-toggle");
  function updateLanguage(lang) {
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
    if (typeof updateTestimonial === "function") {
      tIndex = 0;
      updateTestimonial(0, false);
    }
  }
  if (langToggle) {
    updateLanguage(langToggle.value);
    langToggle.addEventListener("change", function() {
      updateLanguage(this.value);
    });
  }
});

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