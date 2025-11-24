// Admin dashboard controller for TrustBoostAI
// Vanilla JS only; integrates with existing backend admin endpoints

const ADMIN_EMAIL = 'jyehezkel10@gmail.com';
const TOKEN_KEY = 'adminToken';
const RPL_BACKEND = 'https://trustboost-ai-backend-jsyinvest7.replit.app/api';

const qs = (id) => document.getElementById(id);
const show = (el) => el && el.classList.remove('hidden');
const hide = (el) => el && el.classList.add('hidden');

let API_BASE = resolveApiBase();
let adminToken = getToken();
let allUsers = [];
let filteredUsers = [];

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

function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

function setToken(token) {
  adminToken = token || null;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

function redirectToLogin(message) {
  setToken(null);
  if (message) {
    try { sessionStorage.setItem('adminLogoutReason', message); } catch {}
  }
  window.location.href = '/admin.html';
  return null;
}

async function authFetch(url, options = {}) {
  const final = { ...options };
  final.headers = { ...(final.headers || {}) };
  if (adminToken) final.headers['Authorization'] = `Bearer ${adminToken}`;
  const resp = await fetch(url, final);
  if (resp.status === 401 || resp.status === 403) {
    redirectToLogin('Session expired. Please log in as the authorized admin.');
  }
  return resp;
}

async function enforceAdminGuard() {
  if (!adminToken) return redirectToLogin('Please log in first.');
  try {
    const resp = await authFetch(`${API_BASE}/auth/whoami`, { method: 'GET' });
    if (!resp.ok) return redirectToLogin('Unauthorized');
    const data = await resp.json();
    if (!data || data.isAdmin !== true || (data.email || '').toLowerCase() !== ADMIN_EMAIL) {
      return redirectToLogin('Admin access required');
    }
    return data;
  } catch (err) {
    return redirectToLogin('Unable to verify session');
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

function showFatalError(message) {
  const strip = qs('whoami-strip');
  if (strip) {
    strip.textContent = message;
    strip.className = 'admin-strip error reveal-visible';
  }
  const tbody = qs('users-tbody');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="6" class="table-placeholder">${message}</td></tr>`;
  }
}

function updateWhoamiStrip(text, variant = 'info') {
  const strip = qs('whoami-strip');
  if (!strip) return;
  strip.textContent = text;
  strip.className = `admin-strip ${variant} reveal-visible`;
}

function updateAuthedEmail(email) {
  const el = qs('authed-email');
  if (el) el.textContent = email ? `Logged in as ${email}` : 'Validating access…';
}

function renderSummary(users) {
  const total = users.length;
  const counts = users.reduce((acc, u) => {
    const plan = (u.plan || 'starter').toLowerCase();
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {});
  const totalEl = qs('metric-total-users');
  const starterEl = qs('metric-starter');
  const proEl = qs('metric-pro');
  const enterpriseEl = qs('metric-enterprise');
  if (totalEl) totalEl.textContent = total || '0';
  if (starterEl) starterEl.textContent = counts.starter || 0;
  if (proEl) proEl.textContent = counts.pro || 0;
  if (enterpriseEl) enterpriseEl.textContent = counts.enterprise || 0;
}

function tableLoading(message = 'Loading users…') {
  const tbody = qs('users-tbody');
  if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="table-placeholder">${message}</td></tr>`;
}

function renderUsersTable(users) {
  const tbody = qs('users-tbody');
  if (!tbody) return;
  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="table-placeholder">No users match your filters.</td></tr>';
    return;
  }
  tbody.innerHTML = users.map(userRow).join('');
}

function userRow(u) {
  const used = (u.usage && u.usage.used) || 0;
  const limit = (u.usage && u.usage.limit) || 0;
  const percent = limit ? Math.min(100, (used / limit) * 100).toFixed(0) : 0;
  const created = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—';
  const plan = (u.plan || 'Starter');
  return `
    <tr data-user-id="${escapeHtml(u.id || '')}" data-user-email="${escapeHtml(u.email || '')}">
      <td><div class="cell-primary">${escapeHtml(u.email || 'Unknown')}</div><div class="cell-muted">ID: ${escapeHtml(u.id || 'n/a')}</div></td>
      <td><span class="badge-soft">${escapeHtml(plan)}</span></td>
      <td>
        <div class="usage-bar"><div class="usage-fill" style="width:${percent}%"></div></div>
        <div class="cell-muted">${used}/${limit || '∞'} (${percent}%)</div>
      </td>
      <td>${created}</td>
      <td>
        <select class="plan-select" aria-label="Select plan">
          ${['Starter','Pro','Enterprise'].map(p => `<option value="${p}" ${p.toLowerCase() === plan.toLowerCase() ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
      </td>
      <td>
        <div class="row-actions">
          <button class="btn btn-primary btn-xs" data-action="update-plan">Update</button>
          <button class="btn btn-outline btn-xs" data-action="reset-usage">Reset usage</button>
        </div>
      </td>
    </tr>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function applyFilters() {
  const search = qs('user-search')?.value.trim().toLowerCase() || '';
  const planFilter = qs('plan-filter')?.value || 'all';
  filteredUsers = allUsers.filter((u) => {
    const email = (u.email || '').toLowerCase();
    const matchesSearch = !search || email.includes(search);
    const matchesPlan = planFilter === 'all' || (u.plan || '').toLowerCase() === planFilter;
    return matchesSearch && matchesPlan;
  });
  renderUsersTable(filteredUsers);
  renderSummary(allUsers);
  const status = qs('table-status');
  if (status) status.textContent = `${filteredUsers.length} users shown`;
}

async function fetchAdminUsers() {
  const resp = await authFetch(`${API_BASE}/admin/users`, { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load users (${resp.status})`);
  const data = await resp.json();
  if (!Array.isArray(data)) return [];
  return data;
}

async function handlePlanUpdate(btn) {
  const row = btn.closest('tr');
  if (!row) return;
  const userId = row.dataset.userId;
  const email = row.dataset.userEmail;
  const select = row.querySelector('.plan-select');
  const newPlan = select?.value;
  btn.disabled = true;
  btn.textContent = 'Updating…';
  try {
    const resp = await authFetch(`${API_BASE}/admin/update-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email, plan: newPlan })
    });
    if (!resp.ok) throw new Error(`Update failed (${resp.status})`);
    const message = qs('admin-inline-message');
    if (message) {
      message.textContent = `Updated ${email} to ${newPlan}.`;
      message.classList.remove('hidden', 'error');
    }
    await loadUsers();
  } catch (err) {
    const message = qs('admin-inline-message');
    if (message) {
      message.textContent = err.message || 'Could not update plan.';
      message.classList.remove('hidden');
      message.classList.add('error');
    }
  } finally {
    btn.disabled = false;
    btn.textContent = 'Update';
  }
}

async function handleReset(btn) {
  const row = btn.closest('tr');
  if (!row) return;
  const userId = row.dataset.userId;
  const email = row.dataset.userEmail;
  btn.disabled = true;
  btn.textContent = 'Resetting…';
  try {
    const resp = await authFetch(`${API_BASE}/admin/reset-usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email })
    });
    if (!resp.ok) throw new Error(`Reset failed (${resp.status})`);
    const message = qs('admin-inline-message');
    if (message) {
      message.textContent = `Usage reset for ${email}.`;
      message.classList.remove('hidden', 'error');
    }
    await loadUsers();
  } catch (err) {
    const message = qs('admin-inline-message');
    if (message) {
      message.textContent = err.message || 'Could not reset usage.';
      message.classList.remove('hidden');
      message.classList.add('error');
    }
  } finally {
    btn.disabled = false;
    btn.textContent = 'Reset usage';
  }
}

async function loadUsers() {
  tableLoading();
  hide(qs('load-error'));
  const status = qs('table-status');
  if (status) status.textContent = 'Loading…';
  try {
    const who = await enforceAdminGuard();
    if (!who) return;
    updateAuthedEmail(who.email);
    updateWhoamiStrip(`Logged in as ${who.email}`, 'success');
    allUsers = await fetchAdminUsers();
    filteredUsers = allUsers;
    renderUsersTable(allUsers);
    renderSummary(allUsers);
    if (status) status.textContent = `${allUsers.length} users loaded`;
  } catch (err) {
    const errorBox = qs('load-error');
    const errorText = qs('load-error-text');
    if (errorBox) show(errorBox);
    if (errorText) errorText.textContent = err.message || 'Unable to load users.';
    tableLoading('Could not load users');
    if (status) status.textContent = 'Load failed';
  }
}

function bindControls() {
  const search = qs('user-search');
  const filter = qs('plan-filter');
  const refresh = qs('refresh-users');
  const clear = qs('clear-filters');
  const retry = qs('retry-load');
  const logoutBtn = qs('logout-btn');
  const tbody = qs('users-tbody');

  if (search) search.addEventListener('input', () => applyFilters());
  if (filter) filter.addEventListener('change', () => applyFilters());
  if (refresh) refresh.addEventListener('click', () => loadUsers());
  if (clear) clear.addEventListener('click', () => {
    if (search) search.value = '';
    if (filter) filter.value = 'all';
    applyFilters();
  });
  if (retry) retry.addEventListener('click', () => loadUsers());
  if (logoutBtn) logoutBtn.addEventListener('click', () => redirectToLogin('Logged out'));
  if (tbody) {
    tbody.addEventListener('click', (e) => {
      const target = e.target;
      if (target?.dataset.action === 'update-plan') {
        handlePlanUpdate(target);
      } else if (target?.dataset.action === 'reset-usage') {
        handleReset(target);
      }
    });
  }
}

async function initAdminDashboard() {
  initReveal();
  bindControls();
  updateWhoamiStrip('Validating admin session…');
  await loadUsers();
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    initAdminDashboard();
  } catch (err) {
    console.error('Admin dashboard init failed', err);
    showFatalError('Unable to load admin dashboard. Please retry.');
  }
});
