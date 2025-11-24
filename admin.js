// Simplified admin login for TrustBoostAI
(function() {
  const ADMIN_EMAIL = 'jyehezkel10@gmail.com';
  const TOKEN_KEY = 'adminToken';
  const RPL_BACKEND = 'https://trustboost-ai-backend-jsyinvest7.replit.app/api';

  const form = document.getElementById('admin-login-form');
  const emailInput = document.getElementById('admin-username');
  const passwordInput = document.getElementById('admin-password');
  const loginBtn = document.getElementById('login-btn');
  const errorBox = document.getElementById('login-error');
  const unauthorizedBox = document.getElementById('unauthorized-message');

  function resolveApiBase() {
    const host = (typeof window !== 'undefined' && window.location && window.location.host) ? window.location.host : '';
    let base = (typeof window !== 'undefined' && (window.__API_BASE__ || window.VITE_API_BASE_URL || window.NEXT_PUBLIC_API_URL)) || '';
    if (!base) {
      if (/localhost|127\./.test(host)) {
        base = RPL_BACKEND;
      } else if (/trustboost/i.test(host) && !/replit/i.test(host)) {
        base = '/api';
      } else {
        base = RPL_BACKEND;
      }
    }
    return base;
  }

  function show(el, text) {
    if (!el) return;
    if (text) el.textContent = text;
    el.classList.remove('hidden');
  }

  function hide(el) {
    if (!el) return;
    el.classList.add('hidden');
    el.textContent = '';
  }

  function setToken(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    hide(errorBox);
    hide(unauthorizedBox);

    const email = (emailInput?.value || '').trim().toLowerCase();
    const password = (passwordInput?.value || '').trim();

    if (!email || !password) {
      return show(errorBox, 'Please enter email and password.');
    }
    if (email !== ADMIN_EMAIL.toLowerCase()) {
      return show(unauthorizedBox, 'Only the authorized admin can sign in.');
    }

    const API_BASE = resolveApiBase();
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in…';

    try {
      const resp = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = resp.headers.get('content-type')?.includes('application/json') ? await resp.clone().json() : null;
      if (!resp.ok) {
        const reason = data?.reason || data?.error || data?.message || `HTTP ${resp.status}`;
        throw new Error(reason);
      }
      const token = data?.token || data?.accessToken || data?.jwt;
      if (token) setToken(token);
      window.location.href = '/admin/';
    } catch (err) {
      show(errorBox, err.message || 'Login failed.');
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Log in';
    }
  }

  function initReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('reveal-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => observer.observe(el));
  }

  if (form) {
    form.addEventListener('submit', handleLogin);
  }

  document.addEventListener('DOMContentLoaded', initReveal);
})();
